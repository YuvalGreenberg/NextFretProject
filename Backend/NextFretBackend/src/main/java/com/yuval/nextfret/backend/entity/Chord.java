package com.yuval.nextfret.backend.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "chords")
public class Chord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String name;

    @ElementCollection
    @CollectionTable(name = "chord_finger_positions", joinColumns = @JoinColumn(name = "chord_id"))
    @Column(name = "position")
    private List<String> fingerPositions;

    public Chord() {}

    public Chord(String name, List<String> fingerPositions) {
        this.name = name;
        this.fingerPositions = fingerPositions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getFingerPositions() { return fingerPositions; }
    public void setFingerPositions(List<String> fingerPositions) { this.fingerPositions = fingerPositions; }
}
