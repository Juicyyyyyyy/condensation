package fr.fullstack.backend.controller;

import fr.fullstack.backend.service.AuthProxyService;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AuthProxyService authProxyService;

    public AdminUserController(AuthProxyService authProxyService) {
        this.authProxyService = authProxyService;
    }

    @GetMapping
    public ResponseEntity<?> listUsers(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        ResponseEntity<?> err = authProxyService.adminGuard(auth);
        if (err != null) return err;
        return toJson(authProxyService.proxy("/api/admin/users", HttpMethod.GET, auth, null));
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody String body) {
        ResponseEntity<?> err = authProxyService.adminGuard(auth);
        if (err != null) return err;
        return toJson(authProxyService.proxy("/api/admin/users", HttpMethod.POST, auth, body));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable String id) {
        ResponseEntity<?> err = authProxyService.adminGuard(auth);
        if (err != null) return err;
        return toJson(authProxyService.proxy("/api/admin/users/" + id, HttpMethod.GET, auth, null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable String id,
            @RequestBody String body) {
        ResponseEntity<?> err = authProxyService.adminGuard(auth);
        if (err != null) return err;
        return toJson(authProxyService.proxy("/api/admin/users/" + id, HttpMethod.PUT, auth, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable String id) {
        ResponseEntity<?> err = authProxyService.adminGuard(auth);
        if (err != null) return err;
        ResponseEntity<String> resp = authProxyService.proxy("/api/admin/users/" + id, HttpMethod.DELETE, auth, null);
        if (resp.getStatusCode().value() == 204) {
            return ResponseEntity.noContent().build();
        }
        return toJson(resp);
    }

    private ResponseEntity<String> toJson(ResponseEntity<String> resp) {
        return ResponseEntity.status(resp.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(resp.getBody());
    }
}
