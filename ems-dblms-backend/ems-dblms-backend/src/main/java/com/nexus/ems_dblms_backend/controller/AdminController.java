package com.nexus.ems_dblms_backend.controller;

import com.nexus.ems_dblms_backend.dto.*;
import com.nexus.ems_dblms_backend.mapper.UserResponseMapper;
import com.nexus.ems_dblms_backend.model.Department;
import com.nexus.ems_dblms_backend.model.User;
import com.nexus.ems_dblms_backend.repository.DepartmentRepository;
import com.nexus.ems_dblms_backend.service.AuthService;
import com.nexus.ems_dblms_backend.service.DepartmentService;
import com.nexus.ems_dblms_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AuthService authService;
    private final DepartmentRepository departmentRepository;
    private final UserResponseMapper userResponseMapper;
    private final DepartmentService departmentService;
    private final UserService userService;

    @PostMapping("/register-user")
    public ResponseEntity<UserResponse> registerUserByAdmin(@RequestBody RegisterRequest request) {
        User user =  authService.register(request);
        return ResponseEntity.ok(userResponseMapper.toResponseDTO(user));
    }

    @PostMapping("/departments")
    public ResponseEntity<DepartmentResponse> createDepartment(@RequestBody DepartmentRequest departmentRequest) {
        return ResponseEntity.ok(departmentService.createDepartment(departmentRequest));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUserOrManager(@PathVariable Long id) {
        authService.deleteUserOrManagerById(id); // this is for normal users as well
        return ResponseEntity.ok("User deleted successfully, and associated relationships cleared.");
    }

    @PutMapping("/departments/{id}/manager")
    public ResponseEntity<DepartmentResponse> updateManager(
            @PathVariable Long id,
            @RequestBody UpdateManagerRequest request) {
        return ResponseEntity.ok(authService.updateDepartmentManager(id, request));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments(){
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/managers")
    public ResponseEntity<List<UserResponse>> getAllManagersByAdmin(){
        return ResponseEntity.ok(authService.getAllManagersByAdmin());
    }

    @DeleteMapping("/departments")
    public ResponseEntity<String> deleteDepartmentByAdmin(@RequestParam Long departmentId){
        return ResponseEntity.ok(departmentService.deleteDepartmentByAdmin(departmentId));
    }

    @PutMapping("/users")
    public ResponseEntity<UserResponse> updateEmployeeDetailsByAdmin(@RequestParam Long employeeId,
                                                                              @RequestBody UpdateEmployeeRequest request ){
        return ResponseEntity.ok(userService.updateEmployeeDetailsByAdmin(employeeId,request));
    }
}
