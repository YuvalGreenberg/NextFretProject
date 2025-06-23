package com.yuval.nextfret.backend.entity;

import javax.persistence.*;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.sql.Date;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "songs")
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String lyrics;

    @JsonProperty("chordList")
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "song_chords", joinColumns = @JoinColumn(name = "song_id"), inverseJoinColumns = @JoinColumn(name = "chord_id"))
    private List<Chord> chordList;

    @Column(name = "date_added")
    private Date addedDate;

    @JsonProperty("artist")
    private String artistName;

    @Transient
    @JsonProperty("isLiked")
    private boolean isLiked;

    public Song() {
    }

    public Song(String title, String lyrics, List<Chord> chordList) {
        this.title = title;
        this.lyrics = lyrics;
        this.chordList = chordList;
    }

    public Song(String title, String lyrics, List<Chord> chordList, String artistName) {

        this.title = title;
        this.lyrics = lyrics;
        this.chordList = chordList;
        this.artistName = artistName;
    }

    public Song(String title, String lyrics, List<Chord> chordList, Date addedDate) {
        this.addedDate = addedDate;
        this.title = title;
        this.lyrics = lyrics;
        this.chordList = chordList;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLyrics() {
        return lyrics;
    }

    public void setLyrics(String lyrics) {
        this.lyrics = lyrics;
    }

    public List<Chord> getChordList() {
        return chordList;
    }

    public void setChordList(List<Chord> chordList) {
        this.chordList = chordList;
    }

    public Date getAddedDate() {
        return addedDate;
    }

    public void setAddedDate(Date addedDate) {
        this.addedDate = addedDate;
    }

    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setIsLiked(boolean liked) {
        this.isLiked = liked;
    }
}
