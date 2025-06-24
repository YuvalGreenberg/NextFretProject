package com.yuval.nextfret.backend.controller;

import com.yuval.nextfret.backend.service.ItunesCoverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itunes")
public class ItunesController {

    private final ItunesCoverService itunesService;

    @Autowired
    public ItunesController(ItunesCoverService itunesService) {
        this.itunesService = itunesService;
    }

    /**
     * GET /api/itunes/cover?artist=Coldplay&track=Yellow
     */
    @GetMapping("/cover")
    public ResponseEntity<String> getArtworkByName(
            @RequestParam("artist") String artist,
            @RequestParam("track") String track) {
        return itunesService
                .fetchArtworkUrl(artist, track)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}