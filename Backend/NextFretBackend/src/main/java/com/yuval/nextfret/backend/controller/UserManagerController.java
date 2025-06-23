package com.yuval.nextfret.backend.controller;

import com.yuval.nextfret.backend.entity.Song;
import com.yuval.nextfret.backend.entity.User;
import com.yuval.nextfret.backend.service.UserService;
import com.yuval.nextfret.backend.db.Db;
import com.yuval.nextfret.backend.entity.Chord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller לניהול משתמשים (register, login, CRUD).
 */
@RestController
@RequestMapping("/api/userManager")
public class UserManagerController {

    private final UserService userService;
    private final Db db;

    @Autowired
    public UserManagerController(UserService userService, Db db) {
        this.userService = userService;
        this.db = db;
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(user);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User created = userService.registerUser(user);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody User user) {
        User existing = userService.getUserById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        // מעדכן רק שדות: firstName, lastName, email, password
        existing.setFirstName(user.getFirstName());
        existing.setLastName(user.getLastName());
        existing.setEmail(user.getEmail());
        existing.setPassword(user.getPassword());
        User updated = userService.updateUser(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User existing = userService.getUserById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Must supply email and password");
            return ResponseEntity.badRequest().body(err);
        }
        User user = userService.loginUser(email, password);
        if (user == null) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        return ResponseEntity.ok(user);
    }

    // מחזיר את כל האקורדים
    @GetMapping("/chords/all")
    public ResponseEntity<List<Chord>> getAllChords() {
        List<Chord> chords = db.getAllChords();
        return ResponseEntity.ok(chords);
    }

    // מחזיר את האקורדים של המשתמש
    @GetMapping("/{userId}/chords")
    public ResponseEntity<List<Chord>> getUserChords(@PathVariable Long userId) {
        List<Chord> chords = db.getUserChords(userId);
        return ResponseEntity.ok(chords);
    }

    // מוסיף אקורד למשתמש
    @PostMapping("/{userId}/chords")
    public ResponseEntity<?> addUserChord(
            @PathVariable Long userId,
            @RequestBody Map<String, Long> body) {
        Long chordId = body.get("chordId");
        if (chordId == null) {
            return ResponseEntity.badRequest().body("Must supply chordId");
        }
        db.addUserChord(userId, chordId);
        return ResponseEntity.ok().build();
    }

    // מסיר אקורד של המשתמש
    @DeleteMapping("/{userId}/chords/{chordId}")
    public ResponseEntity<?> deleteUserChord(
            @PathVariable Long userId,
            @PathVariable Long chordId) {
        db.deleteUserChord(userId, chordId);
        return ResponseEntity.ok().build();
    }

    // מחזיר את ספריית השירים של המשתמש
    @GetMapping("/{userId}/library")
    public ResponseEntity<List<Song>> getUserLibrary(@PathVariable Long userId) {
        List<Song> library = userService.getLibraryByUserId(userId);
        return ResponseEntity.ok(library);
    }

    // מחזיר את פרטי השיר המלאים למשתמש על פי ID
    @GetMapping("/{userId}/fullSong/{songId}")
    public ResponseEntity<?> getUserFullSong(
            @PathVariable Long userId,
            @PathVariable Long songId) {
        try {
            Song song = userService.getFullSongByUserId(userId, songId);
            if (song == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(song);
        } catch (Exception e) {
            // Log the full stack trace
            e.printStackTrace();
            // Return a JSON body showing the error message
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    // מוסיף שיר לספריית המשתמש (לייק)
    @PostMapping("/{userId}/songs/{songId}")
    public ResponseEntity<?> addUserSong(
            @PathVariable Long userId,
            @PathVariable Long songId) {
        db.addUserSong(userId, songId);
        return ResponseEntity.ok().build();
    }

    // מסיר שיר מהספרייה (אנלייק)
    @DeleteMapping("/{userId}/songs/{songId}")
    public ResponseEntity<?> deleteUserSong(
            @PathVariable Long userId,
            @PathVariable Long songId) {
        db.deleteUserSong(userId, songId);
        return ResponseEntity.ok().build();
    }

}
