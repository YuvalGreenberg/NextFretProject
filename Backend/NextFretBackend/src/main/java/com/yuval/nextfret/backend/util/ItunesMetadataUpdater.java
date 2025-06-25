package com.yuval.nextfret.backend.util;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;
import com.yuval.nextfret.backend.service.ItunesCoverService;

public class ItunesMetadataUpdater {
    public static void main(String[] args) {
        String dbUrl = "jdbc:postgresql://db.ecwsiekdjkjrnhqyqbgc.supabase.co:5432/postgres?sslmode=require";
        String dbUser = "postgres";
        String dbPass = "OrelYuval2025";

        int successCount = 0;
        int failCount = 0;

        ItunesCoverService itunesService = new ItunesCoverService();
        Map<String, Integer> genreCache = new HashMap<>();

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass)) {

            PreparedStatement songsStmt = conn.prepareStatement(
                "SELECT id, title, artist_id FROM songs WHERE id NOT IN (SELECT DISTINCT song_id FROM song_genres)"
            );
            ResultSet songs = songsStmt.executeQuery();

            while (songs.next()) {
                try {
                    int songId = songs.getInt("id");
                    String title = songs.getString("title");
                    int artistId = songs.getInt("artist_id");

                    if (artistId == 0) {
                        System.out.println("⚠️ Skipping song with no artist: " + songId);
                        failCount++;
                        continue;
                    }

                    // Get artist name
                    String artist = "";
                    try (PreparedStatement artistStmt = conn.prepareStatement("SELECT name FROM artists WHERE id = ?")) {
                        artistStmt.setInt(1, artistId);
                        ResultSet artistRs = artistStmt.executeQuery();
                        if (artistRs.next()) {
                            artist = artistRs.getString("name");
                        }
                    }

                    // Fetch from iTunes
                    String artworkUrl = itunesService.fetchArtworkUrl(artist, title).orElse(null);
                    String previewUrl = itunesService.fetchPreviewUrl(artist, title).orElse(null);
                    String genre = itunesService.fetchGenre(artist, title).orElse(null);

                    // Update artwork/preview only if not null
                    if (artworkUrl != null || previewUrl != null) {
                        try (PreparedStatement updateStmt = conn.prepareStatement(
                                "UPDATE songs SET artwork_url = COALESCE(?, artwork_url), preview_url = COALESCE(?, preview_url) WHERE id = ?")) {
                            updateStmt.setString(1, artworkUrl);
                            updateStmt.setString(2, previewUrl);
                            updateStmt.setInt(3, songId);
                            updateStmt.executeUpdate();
                        }
                    }

                    if (genre != null) {
                        int genreId = genreCache.getOrDefault(genre.toLowerCase(), -1);

                        if (genreId == -1) {
                            // Check if genre exists
                            try (PreparedStatement checkGenre = conn.prepareStatement(
                                    "SELECT id FROM genres WHERE LOWER(name) = LOWER(?)")) {
                                checkGenre.setString(1, genre);
                                ResultSet genreRs = checkGenre.executeQuery();
                                if (genreRs.next()) {
                                    genreId = genreRs.getInt("id");
                                }
                            }

                            // Insert if not exists
                            if (genreId == -1) {
                                try (PreparedStatement insertGenre = conn.prepareStatement(
                                        "INSERT INTO genres(name) VALUES (?) RETURNING id")) {
                                    insertGenre.setString(1, genre);
                                    ResultSet newGenreRs = insertGenre.executeQuery();
                                    if (newGenreRs.next()) {
                                        genreId = newGenreRs.getInt("id");
                                    }
                                }
                            }

                            genreCache.put(genre.toLowerCase(), genreId);
                        }

                        // Link song to genre
                        try (PreparedStatement checkLink = conn.prepareStatement(
                                "SELECT 1 FROM song_genres WHERE song_id = ? AND genre_id = ?")) {
                            checkLink.setInt(1, songId);
                            checkLink.setInt(2, genreId);
                            ResultSet exists = checkLink.executeQuery();
                            if (!exists.next()) {
                                try (PreparedStatement insertLink = conn.prepareStatement(
                                        "INSERT INTO song_genres(song_id, genre_id) VALUES (?, ?)")) {
                                    insertLink.setInt(1, songId);
                                    insertLink.setInt(2, genreId);
                                    insertLink.executeUpdate();
                                }
                            }
                        }
                    }

                    System.out.println("✅ Updated song ID: " + songId);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("❌ Failed to process song. Skipping.");
                    e.printStackTrace();
                    failCount++;
                }
            }

            System.out.println("🎉 Done.");
            System.out.println("✅ Total successful updates: " + successCount);
            System.out.println("❌ Total failed updates: " + failCount);

        } catch (Exception e) {
            System.err.println("❌ Critical database error");
            e.printStackTrace();
        }
    }
}