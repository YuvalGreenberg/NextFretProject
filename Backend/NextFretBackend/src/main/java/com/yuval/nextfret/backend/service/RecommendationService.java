package com.yuval.nextfret.backend.service;

import com.yuval.nextfret.backend.db.Db;
import com.yuval.nextfret.backend.entity.Song;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    private final Db db;

    @Autowired
    public RecommendationService(Db db) {
        this.db = db;
    }

    public List<Song> recommendSongsForUser(Long userId, Integer maxUnknown) {
        if (maxUnknown != null) {
            return db.getRecommendationsForUserWithMaxUnknown(userId, maxUnknown);
        } else {
            return db.getRecommendationsForUser(userId);
        }
    }

    public List<Song> searchSongs(String query) {
        return db.searchSongs(query);
    }

    
}
