package com.nexus.ems_dblms_backend.controller;

import com.nexus.ems_dblms_backend.dto.UserResponse;
import com.nexus.ems_dblms_backend.mapper.UserResponseMapper;
import com.nexus.ems_dblms_backend.model.User;
import com.nexus.ems_dblms_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserResponseMapper userResponseMapper;

    @GetMapping("/view")
    public ResponseEntity<UserResponse> viewEmployee(@RequestParam Long employeeId){
         User user = userService.getUserDetails(employeeId);

         return ResponseEntity.ok(userResponseMapper.toResponseDTO(user));
    }
}
