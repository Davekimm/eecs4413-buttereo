package com.dk.buttereo.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String FRONTEND_ORIGIN = "http://localhost:5173";

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(FRONTEND_ORIGIN));          // Allow any requests from this origin.
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));                  // Allow any headers.
        configuration.setAllowCredentials(true);                       // Receives credentials from the browser.

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);         // Apply these trust settings to every endpoint
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())                                // Use corsConfigurationSource() for web configuration
                .csrf(csrf -> csrf.disable())               // Disable and not using tokens in this project for ease.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login",
                                         "/api/auth/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/product/**").permitAll()     // Allowing unauthorized users to browse products.
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            } else {
                                response.sendRedirect("/login");
                            }
                        })
                )
                .httpBasic(AbstractHttpConfigurer::disable)                 // Avoid browser automatic sign-in popup on 401
                .formLogin(form -> form
                        .loginPage("/login")              // Guard that directs unauthenticated users to this authentication endpoint.
                        .loginProcessingUrl("/login")           // POST send username + password to this authentication endpoint
                        .failureUrl("/login?error")             // Failed auth and send frontend "/login?error"
                        .defaultSuccessUrl(FRONTEND_ORIGIN + "/?fromLogin=1", true))
                .logout(config -> config
                        .logoutSuccessUrl(FRONTEND_ORIGIN + "/?loggedOut=1"))    // Direct user to this url after a successful logout.
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
