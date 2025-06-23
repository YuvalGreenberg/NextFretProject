package com.yuval.nextfret.backend.repository;

import com.yuval.nextfret.backend.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {
}
