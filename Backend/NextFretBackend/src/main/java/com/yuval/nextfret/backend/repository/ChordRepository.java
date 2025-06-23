package com.yuval.nextfret.backend.repository;

import com.yuval.nextfret.backend.entity.Chord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChordRepository extends JpaRepository<Chord, Long> {
    Optional<Chord> findByName(String name);
}
