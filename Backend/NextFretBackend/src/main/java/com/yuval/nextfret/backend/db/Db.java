package com.yuval.nextfret.backend.db;

import com.yuval.nextfret.backend.entity.User;
import com.yuval.nextfret.backend.entity.Song;
import com.yuval.nextfret.backend.entity.Chord;
import com.yuval.nextfret.backend.entity.Genre;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Db.java – שכבת גישה ל־PostgreSQL, מקבלת את פרטי החיבור
 * מ־application.properties.
 */
@Component
public class Db {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @PostConstruct
    private void init() {
        System.out.println("Loaded DB properties: URL=" + dbUrl + ", USER=" + dbUser);
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("PostgreSQL JDBC Driver not found", e);
        }
    }

    /**
     * מחזיר Connection ל־PostgreSQL על פי application.properties.
     */
    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }

    // –––––– CRUD למשתמשים (Users) ––––––

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT id, first_name, last_name, email, password FROM users";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setFirstName(rs.getString("first_name"));
                u.setLastName(rs.getString("last_name"));
                u.setEmail(rs.getString("email"));
                u.setPassword(rs.getString("password"));
                users.add(u);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return users;
    }

    public User getUserById(Long id) {
        String sql = "SELECT id, first_name, last_name, email, password FROM users WHERE id = ?";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User u = new User();
                    u.setId(rs.getLong("id"));
                    u.setFirstName(rs.getString("first_name"));
                    u.setLastName(rs.getString("last_name"));
                    u.setEmail(rs.getString("email"));
                    u.setPassword(rs.getString("password"));
                    return u;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public User insertUser(User user) {
        String sql = "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?) RETURNING id";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, user.getFirstName());
            stmt.setString(2, user.getLastName());
            stmt.setString(3, user.getEmail());
            stmt.setString(4, user.getPassword());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    user.setId(rs.getLong("id"));
                }
            }
            return user;

        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error inserting user: " + e.getMessage());
        }
    }

    public User updateUser(User user) {
        String sql = "UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ? WHERE id = ?";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, user.getFirstName());
            stmt.setString(2, user.getLastName());
            stmt.setString(3, user.getEmail());
            stmt.setString(4, user.getPassword());
            stmt.setLong(5, user.getId());

            stmt.executeUpdate();
            return user;

        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error updating user: " + e.getMessage());
        }
    }

    public void deleteUser(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error deleting user: " + e.getMessage());
        }
    }

    public User login(String email, String password) {
        String sql = "SELECT id, first_name, last_name, email, password FROM users WHERE LOWER(email) = LOWER(?) AND password = ?";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setString(2, password);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User u = new User();
                    u.setId(rs.getLong("id"));
                    u.setFirstName(rs.getString("first_name"));
                    u.setLastName(rs.getString("last_name"));
                    u.setEmail(rs.getString("email"));
                    u.setPassword(rs.getString("password"));
                    return u;
                } else {
                    return null;
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error during login: " + e.getMessage());
        }
    }

    // –––––– CRUD לשירים (Songs) ––––––

    public List<Song> getAllSongs() {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT id, title, lyrics FROM songs";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Song s = new Song();
                s.setId(rs.getLong("id"));
                s.setTitle(rs.getString("title"));
                s.setLyrics(rs.getString("lyrics"));
                songs.add(s);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return songs;
    }

    public List<Song> getRecommendationsForUser(Long userId) {
        List<Song> songs = new ArrayList<>();
        String sql = "WITH user_known AS (" +
                "  SELECT chord_id FROM user_chords WHERE user_id = ?" +
                ") " +
                "SELECT s.id, s.title, s.lyrics, a.name AS artist_name " +
                "FROM songs s " +
                "JOIN song_chords sc ON s.id = sc.song_id " +
                "JOIN chords c ON sc.chord_id = c.id " +
                "LEFT JOIN artists a ON s.artist_id = a.id " +
                "WHERE s.id NOT IN (" +
                "  SELECT song_id FROM user_songs WHERE user_id = ?" +
                ") " +
                "GROUP BY s.id, s.title, s.lyrics, a.name " +
                "HAVING SUM(CASE WHEN sc.chord_id NOT IN (SELECT chord_id FROM user_known) THEN c.difficulty ELSE 0 END) <= 5 "
                +
                "ORDER BY SUM(CASE WHEN sc.chord_id NOT IN (SELECT chord_id FROM user_known) THEN c.difficulty ELSE 0 END) ASC, random() "
                +
                "LIMIT 20";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            stmt.setLong(2, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Song s = new Song();
                    s.setId(rs.getLong("id"));
                    s.setTitle(rs.getString("title"));
                    s.setLyrics(rs.getString("lyrics"));
                    s.setArtistName(rs.getString("artist_name"));
                    // Populate full chord list for the song
                    String chordSql = "SELECT c.id, c.name FROM chords c " +
                            "JOIN song_chords sc2 ON c.id = sc2.chord_id " +
                            "WHERE sc2.song_id = ?";
                    try (PreparedStatement chordStmt = conn.prepareStatement(chordSql)) {
                        chordStmt.setLong(1, s.getId());
                        try (ResultSet crs = chordStmt.executeQuery()) {
                            List<Chord> chordList = new ArrayList<>();
                            while (crs.next()) {
                                Chord chord = new Chord();
                                chord.setId(crs.getLong("id"));
                                chord.setName(crs.getString("name"));
                                chordList.add(chord);
                            }
                            s.setChordList(chordList);
                        }
                    }
                    songs.add(s);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching recommendations: " + e.getMessage(), e);
        }
        return songs;
    }

    // –––––– CRUD לאקורדים (Chords) ––––––

    public List<Chord> getAllChords() {
        List<Chord> chords = new ArrayList<>();
        String sql = "SELECT id, name FROM chords";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Chord c = new Chord();
                c.setId(rs.getLong("id"));
                c.setName(rs.getString("name"));
                chords.add(c);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return chords;
    }

    public List<Chord> getUserChords(Long userId) {
        List<Chord> chords = new ArrayList<>();
        String sql = "SELECT c.id, c.name FROM chords c " +
                "JOIN user_chords uc ON c.id = uc.chord_id " +
                "WHERE uc.user_id = ?";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Chord c = new Chord();
                    c.setId(rs.getLong("id"));
                    c.setName(rs.getString("name"));
                    chords.add(c);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return chords;
    }

    public void addUserChord(Long userId, Long chordId) {
        String sql = "INSERT INTO user_chords (user_id, chord_id) VALUES (?, ?)";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);
            stmt.setLong(2, chordId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error adding user chord: " + e.getMessage());
        }
    }

    public void deleteUserChord(Long userId, Long chordId) {
        String sql = "DELETE FROM user_chords WHERE user_id = ? AND chord_id = ?";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);
            stmt.setLong(2, chordId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error deleting user chord: " + e.getMessage());
        }
    }

    public List<Song> getLibraryByUserId(Long userId) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT s.id, s.title, s.lyrics, s.artwork_url, a.name AS artist_name, us.date_added " +
                "FROM songs s " +
                "JOIN user_songs us ON s.id = us.song_id " +
                "LEFT JOIN artists a ON s.artist_id = a.id " +
                "WHERE us.user_id = ?";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Song s = new Song();
                    s.setId(rs.getLong("id"));
                    s.setTitle(rs.getString("title"));
                    s.setLyrics(rs.getString("lyrics"));
                    s.setArtistName(rs.getString("artist_name"));
                    s.setAddedDate(rs.getDate("date_added"));
                    s.setCoverUrl(rs.getString("artwork_url")); // הוספת שורת הקאבר
                    songs.add(s);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching user library: " + e.getMessage(), e);
        }
        return songs;
    }

    public void addSongToUserLibrary(Long userId, Long songId) {
        String sql = "INSERT INTO user_songs (user_id, song_id, date_added) VALUES (?, ? , NOW())";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            stmt.setLong(2, songId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error adding song to user library: " + e.getMessage());
        }

    }

    public Song getFullSongDetailsForUser(Long userId, Long songId) {
        String songSql = "SELECT s.id, s.title, s.lyrics, s.artwork_url, s.preview_url, a.name AS artist_name " +
                         "FROM songs s " +
                         "JOIN artists a ON s.artist_id = a.id " +
                         "WHERE s.id = ?";
    
        try (Connection conn = getConnection();
             PreparedStatement songStmt = conn.prepareStatement(songSql)) {
    
            songStmt.setLong(1, songId);
            try (ResultSet rs = songStmt.executeQuery()) {
                if (!rs.next()) {
                    return null; // song does not exist
                }
    
                Song song = new Song();
                song.setId(rs.getLong("id"));
                song.setTitle(rs.getString("title"));
                song.setLyrics(rs.getString("lyrics"));
                song.setArtistName(rs.getString("artist_name"));
                song.setCoverUrl(rs.getString("artwork_url"));
                song.setPreviewUrl(rs.getString("preview_url"));
    
                // Fetch genre object
                String genreSql = "SELECT g.id, g.name " +
                                  "FROM genres g " +
                                  "JOIN song_genres sg ON sg.genre_id = g.id " +
                                  "WHERE sg.song_id = ? LIMIT 1";
                try (PreparedStatement genreStmt = conn.prepareStatement(genreSql)) {
                    genreStmt.setLong(1, songId);
                    try (ResultSet grs = genreStmt.executeQuery()) {
                        if (grs.next()) {
                            Genre genre = new Genre();
                            genre.setId(grs.getLong("id"));
                            genre.setTitle(grs.getString("name"));
                            song.setGenre(genre);
                        }
                    }
                }
    
                // Fetch chords for this song
                String chordSql = "SELECT c.id, c.name, c.difficulty " +
                                  "FROM chords c " +
                                  "JOIN song_chords sc ON c.id = sc.chord_id " +
                                  "WHERE sc.song_id = ?";
                try (PreparedStatement chordStmt = conn.prepareStatement(chordSql)) {
                    chordStmt.setLong(1, songId);
                    try (ResultSet crs = chordStmt.executeQuery()) {
                        List<Chord> chordList = new ArrayList<>();
                        while (crs.next()) {
                            Chord chord = new Chord();
                            chord.setId(crs.getLong("id"));
                            chord.setName(crs.getString("name"));
                            chord.setDifficulty(crs.getShort("difficulty"));
                            chordList.add(chord);
                        }
                        song.setChordList(chordList);
                    }
                }
    
                // Check if user liked the song
                String likeSql = "SELECT 1 FROM user_songs us WHERE us.user_id = ? AND us.song_id = ? LIMIT 1";
                try (PreparedStatement likeStmt = conn.prepareStatement(likeSql)) {
                    likeStmt.setLong(1, userId);
                    likeStmt.setLong(2, songId);
                    try (ResultSet lrs = likeStmt.executeQuery()) {
                        song.setIsLiked(lrs.next());
                    }
                }
    
                return song;
            }
    
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching full song details for user: " + e.getMessage(), e);
        }
    }

    public void addUserSong(Long userId, Long songId) {
        String sql = "INSERT INTO user_songs (user_id, song_id, date_added) VALUES (?, ?, NOW())";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            stmt.setLong(2, songId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error adding song to user library: " + e.getMessage(), e);
        }
    }

    public void deleteUserSong(Long userId, Long songId) {
        String sql = "DELETE FROM user_songs WHERE user_id = ? AND song_id = ?";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            stmt.setLong(2, songId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error deleting song from user library: " + e.getMessage(), e);
        }
    }

    /**
     * Uses PostgreSQL full-text search for searching songs by title and artist
     * name.
     * Make sure to create a GIN index for performance:
     * CREATE INDEX songs_search_idx ON songs USING GIN (to_tsvector('simple',
     * title));
     */
    public List<Song> searchSongs(String query) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT s.id, s.title, s.lyrics, s.artwork_url, a.name AS artist_name " +
                "FROM songs s " +
                "JOIN artist_songs aps ON s.id = aps.song_id " +
                "JOIN artists a ON aps.artist_id = a.id " +
                "WHERE to_tsvector('simple', s.title || ' ' || a.name) @@ plainto_tsquery('simple', ?)";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, query);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Song s = new Song();
                    s.setId(rs.getLong("id"));
                    s.setTitle(rs.getString("title"));
                    s.setLyrics(rs.getString("lyrics"));
                    s.setArtistName(rs.getString("artist_name"));
                    s.setCoverUrl(rs.getString("artwork_url"));
                    songs.add(s);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error searching songs: " + e.getMessage(), e);
        }
        return songs;
    }

    public List<Song> getRecommendationsForUserWithMaxUnknown(Long userId, Integer maxUnknown) {
        List<Song> songs = new ArrayList<>();

        String sql = "WITH user_known AS (" +
                "  SELECT chord_id FROM user_chords WHERE user_id = ?" +
                ") " +
                "SELECT s.id, s.title, s.lyrics, a.name AS artist_name, s.artwork_url, " +
                "  SUM(CASE WHEN sc.chord_id NOT IN (SELECT chord_id FROM user_known) THEN 1 ELSE 0 END) AS unknown_chords " +
                "FROM songs s " +
                "JOIN song_chords sc ON s.id = sc.song_id " +
                "JOIN chords c ON sc.chord_id = c.id " +
                "LEFT JOIN artists a ON s.artist_id = a.id " +
                "LEFT JOIN song_genres sg ON s.id = sg.song_id " +
                "WHERE s.id NOT IN (" +
                "  SELECT song_id FROM user_songs WHERE user_id = ?" +
                ") " +
                "AND (EXISTS (SELECT 1 FROM song_genres sg2 " +
                "JOIN user_genres ug2 ON sg2.genre_id = ug2.genre_id " +
                "WHERE sg2.song_id = s.id AND ug2.user_id = ?)) " +
                "GROUP BY s.id, s.title, s.lyrics, a.name, s.artwork_url " +
                "HAVING SUM(CASE WHEN sc.chord_id NOT IN (SELECT chord_id FROM user_known) THEN 1 ELSE 0 END) = ? " +
                "ORDER BY COUNT(DISTINCT CASE WHEN sg.genre_id IN (SELECT genre_id FROM user_genres WHERE user_id = ?) THEN sg.genre_id END) DESC, random() " +
                "LIMIT 20";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);  // user_known subquery
            stmt.setLong(2, userId);  // NOT IN user_songs
            stmt.setLong(3, userId);  // genre filter subquery
            stmt.setInt(4, maxUnknown);  // HAVING
            stmt.setLong(5, userId);  // ORDER BY genre match

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Song s = new Song();
                    s.setId(rs.getLong("id"));
                    s.setTitle(rs.getString("title"));
                    s.setLyrics(rs.getString("lyrics"));
                    s.setArtistName(rs.getString("artist_name"));
                    s.setCoverUrl(rs.getString("artwork_url")); // ✅

                    // Fetch chord list
                    String chordSql = "SELECT c.id, c.name FROM chords c " +
                            "JOIN song_chords sc2 ON c.id = sc2.chord_id " +
                            "WHERE sc2.song_id = ?";
                    try (PreparedStatement chordStmt = conn.prepareStatement(chordSql)) {
                        chordStmt.setLong(1, s.getId());
                        try (ResultSet crs = chordStmt.executeQuery()) {
                            List<Chord> chordList = new ArrayList<>();
                            while (crs.next()) {
                                Chord chord = new Chord();
                                chord.setId(crs.getLong("id"));
                                chord.setName(crs.getString("name"));
                                chordList.add(chord);
                            }
                            s.setChordList(chordList);
                        }
                    }

                    songs.add(s);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching filtered recommendations: " + e.getMessage(), e);
        }

        return songs;
    }

    public List<Genre> getFavoriteGenresForUser(Long userId) {
        List<Genre> genres = new ArrayList<>();

        String sql = "SELECT g.id, g.name " +
                "FROM genres g " +
                "JOIN user_genres ug ON g.id = ug.genre_id " +
                "WHERE ug.user_id = ?";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Genre genre = new Genre();
                    genre.setId(rs.getLong("id"));
                    genre.setTitle(rs.getString("name"));
                    genres.add(genre);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching favorite genres: " + e.getMessage(), e);
        }

        return genres;
    }

    public List<Genre> getAllGenres() {
        List<Genre> genres = new ArrayList<>();
        String sql = "SELECT id, name FROM genres";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Genre g = new Genre();
                g.setId(rs.getLong("id"));
                g.setTitle(rs.getString("name"));
                genres.add(g);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return genres;
    }

    public void addUserGenre(Long userId, Long genreId) {
        String sql = "INSERT INTO user_genres (user_id, genre_id) VALUES (?, ?)";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            stmt.setLong(2, genreId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error adding genre to user: " + e.getMessage());
        }
    }

    public void deleteUserGenre(Long userId, Long genreId) {
        String sql = "DELETE FROM user_genres WHERE user_id = ? AND genre_id = ?";

        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            stmt.setLong(2, genreId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error deleting genre from user: " + e.getMessage());
        }
    }

}
