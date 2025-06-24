package com.yuval.nextfret.backend.controller;

import com.yuval.nextfret.backend.entity.Song;
import com.yuval.nextfret.backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendationEngine")
public class RecommendationEngineController {

    private final RecommendationService recommendationService;

    @Autowired
    public RecommendationEngineController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Song>> getRecommendations(@PathVariable Long userId) {
        List<Song> recs = recommendationService.recommendSongsForUser(userId);
        return ResponseEntity.ok(recs);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Song>> search(@RequestParam("query") String query) {
        List<Song> results = recommendationService.searchSongs(query);
        return ResponseEntity.ok(results);
    }
}
