package com.yuval.nextfret.backend.service;

import com.yuval.nextfret.backend.db.Db;
import com.yuval.nextfret.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final Db db;

    @Autowired
    public UserService(Db db) {
        this.db = db;
    }

    public List<User> getAllUsers() {
        return db.getAllUsers();
    }

    public User getUserById(Long id) {
        return db.getUserById(id);
    }

    public User registerUser(User user) {
        return db.insertUser(user);
    }

    public User updateUser(User user) {
        return db.updateUser(user);
    }

    public void deleteUser(Long id) {
        db.deleteUser(id);
    }

    public User loginUser(String email, String password) {
        return db.login(email, password);
    }
}
