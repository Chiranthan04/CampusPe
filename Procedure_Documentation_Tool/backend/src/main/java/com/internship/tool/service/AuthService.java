package com.internship.tool.service;

import com.internship.tool.config.JwtUtil;
import com.internship.tool.dto.AuthRequest;
import com.internship.tool.dto.AuthResponse;
import com.internship.tool.dto.RegisterRequest;
import com.internship.tool.entity.User;
import com.internship.tool.exception.UserAlreadyExistsException;
import com.internship.tool.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService    userDetailsService;

    // ── Register ─────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // Check duplicates
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException(
                "Username already exists: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                "Email already exists: " + request.getEmail());
        }

        // Build user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("USER");

        userRepository.save(user);

        // Generate tokens
        UserDetails userDetails =
            userDetailsService.loadUserByUsername(user.getUsername());

        String accessToken  = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return new AuthResponse(
            accessToken,
            refreshToken,
            user.getUsername(),
            user.getRole()
        );
    }

    // ── Login ────────────────────────────────────────────────
    public AuthResponse login(AuthRequest request) {

        // Authenticate — throws if invalid
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        UserDetails userDetails =
            userDetailsService.loadUserByUsername(request.getUsername());

        String accessToken  = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow();

        return new AuthResponse(
            accessToken,
            refreshToken,
            user.getUsername(),
            user.getRole()
        );
    }

    // ── Refresh Token ────────────────────────────────────────
    public AuthResponse refresh(String refreshToken) {
        try {
            String username = jwtUtil.extractUsername(refreshToken);

            UserDetails userDetails =
                userDetailsService.loadUserByUsername(username);

            if (jwtUtil.isTokenValid(refreshToken, userDetails)) {
                String newAccessToken  = jwtUtil.generateToken(userDetails);
                String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

                User user = userRepository.findByUsername(username).orElseThrow();

                return new AuthResponse(
                    newAccessToken,
                    newRefreshToken,
                    user.getUsername(),
                    user.getRole()
                );
            }
            throw new RuntimeException("Invalid refresh token");
        } catch (Exception e) {
            throw new RuntimeException("Refresh token failed: " + e.getMessage());
        }
    }
}
