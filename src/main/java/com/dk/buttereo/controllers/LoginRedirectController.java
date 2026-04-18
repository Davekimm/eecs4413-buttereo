package com.dk.buttereo.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class LoginRedirectController {

    private static final String FRONT_LOGIN_URL = "http://localhost:5173/login";

    @GetMapping("/login")
    public RedirectView redirectToSpaLogin(HttpServletRequest request) {
        String query = request.getQueryString();
        if (query != null && !query.isEmpty()) {
            return new RedirectView(FRONT_LOGIN_URL + "?" + query);
        }
        return new RedirectView(FRONT_LOGIN_URL);
    }
}
