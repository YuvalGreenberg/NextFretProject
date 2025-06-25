package com.yuval.nextfret.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Collections;

@Service
public class ItunesCoverService {
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();
    private static final String ITUNES_URL = "https://itunes.apple.com/search?term={term}&entity=song&limit=1";

    /**
     * Searches iTunes for the given artist and track, and returns the artwork URL.
     */
    public Optional<String> fetchArtworkUrl(String artist, String track) {
        try {
            // Encode "Artist Track" into a single term
            String term = artist + " " + track;
            // Manually build the full URL
            String url = "https://itunes.apple.com/search?term=" + term + "&entity=song&limit=1";

            // 🔍 הדפסות דיבאג:
            System.out.println("🔍 Searching term: " + artist + " " + track);
            System.out.println("🌐 Final URL: " + url);

            // Fetch raw JSON as String
            String json = rest.getForObject(url, String.class);

            // הדפסת תגובת ה־JSON
            System.out.println("📥 Response JSON: " + json);

            if (json == null) {
                return Optional.empty();
            }

            // Parse with Jackson
            JsonNode root = mapper.readTree(json);
            JsonNode results = root.path("results");
            if (results.isArray() && results.size() > 0) {
                String url100 = results.get(0).path("artworkUrl100").asText(null);
                if (url100 != null) {
                    // Replace "100x100" → "600x600" for higher resolution
                    return Optional.of(url100.replace("100x100", "600x600"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace(); // לא לדלג על זה!
        }
        return Optional.empty();
    }

    /**
     * Fetches the album/collection name from iTunes for given artist and track.
     */
    public Optional<String> fetchCollectionName(String artist, String track) {
        try {
            String term = artist + " " + track;
            String url = "https://itunes.apple.com/search?term=" + term + "&entity=song&limit=1";
            String json = rest.getForObject(url, String.class);
            if (json == null)
                return Optional.empty();

            JsonNode root = mapper.readTree(json);
            JsonNode results = root.path("results");
            if (results.isArray() && results.size() > 0) {
                String collection = results.get(0).path("collectionName").asText(null);
                return Optional.ofNullable(collection);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /**
     * Fetches the genre from iTunes for given artist and track.
     */
    public Optional<String> fetchGenre(String artist, String track) {
        try {
            String term = artist + " " + track;
            String url = "https://itunes.apple.com/search?term=" + term + "&entity=song&limit=1";
            String json = rest.getForObject(url, String.class);
            if (json == null)
                return Optional.empty();

            JsonNode root = mapper.readTree(json);
            JsonNode results = root.path("results");
            if (results.isArray() && results.size() > 0) {
                String genre = results.get(0).path("primaryGenreName").asText(null);
                return Optional.ofNullable(genre);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /**
     * Fetches preview URL for audio sample of song from iTunes.
     */
    public Optional<String> fetchPreviewUrl(String artist, String track) {
        try {
            String term = artist + " " + track;
            String url = "https://itunes.apple.com/search?term=" + term + "&entity=song&limit=1";
            String json = rest.getForObject(url, String.class);
            if (json == null)
                return Optional.empty();

            JsonNode root = mapper.readTree(json);
            JsonNode results = root.path("results");
            if (results.isArray() && results.size() > 0) {
                String previewUrl = results.get(0).path("previewUrl").asText(null);
                return Optional.ofNullable(previewUrl);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

}