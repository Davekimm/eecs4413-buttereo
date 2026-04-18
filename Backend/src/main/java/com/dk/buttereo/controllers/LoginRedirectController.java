package com.dk.buttereo.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Controller for handling login-related redirects.
 */
@Controller
public class LoginRedirectController {

    private static final String FRONT_LOGIN_URL = "http://localhost:5173/login";

    /**
     * Redirects to the Single Page Application (SPA) login page, preserving any query parameters.
     *
     * @param request The HTTP servlet request.
     * @return RedirectView to the SPA login page with preserved query parameters.
     */
    @GetMapping("/login")
    public RedirectView redirectToSpaLogin(HttpServletRequest request) {
        String query = request.getQueryString();
        if (query != null && !query.isEmpty()) {
            return new RedirectView(FRONT_LOGIN_URL + "?" + query);
        }
        return new RedirectView(FRONT_LOGIN_URL);
    }
}
