package com.nexus.ems_dblms_backend.service;

import com.nexus.ems_dblms_backend.dto.*;
import com.nexus.ems_dblms_backend.exception.ResourceInUseException;
import com.nexus.ems_dblms_backend.exception.ResourceNotFoundException;
import com.nexus.ems_dblms_backend.mapper.DepartmentMapper;
import com.nexus.ems_dblms_backend.mapper.UserResponseMapper;
import com.nexus.ems_dblms_backend.model.Department;
import com.nexus.ems_dblms_backend.model.Role;
import com.nexus.ems_dblms_backend.model.User;
import com.nexus.ems_dblms_backend.repository.DepartmentRepository;
import com.nexus.ems_dblms_backend.repository.UserRepository;
import com.nexus.ems_dblms_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Lazy
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserResponseMapper userResponseMapper;
    private final DepartmentMapper departmentMapper;

    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new RuntimeException("Username already exists!");
        }

        Department department = null;

        if (request.departmentId() != null) {
            department = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
        }

        User user = User.builder()
                .username(request.username())
                // Securely hash the password before saving it to MySQL
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .department(department)
                .fullName(request.fullName())
                .designation(request.designation())
                .build();
        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request){
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        Long deptId = (user.getDepartment() != null) ? user.getDepartment().getId() : null;

        return new AuthResponse(token, user.getUsername(), user.getRole(), user.getId());
    }

    @Transactional
    public void deleteUserOrManagerById(Long userId) {
        // 1. Check if the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() == Role.ROLE_MANAGER) {
            List<Department> departments = departmentRepository.findByManagerId(userId);

            if (!departments.isEmpty()) {

                String deptNames = departments.stream()
                        .map(Department::getName)
                        .collect(java.util.stream.Collectors.joining(", "));

                throw new ResourceInUseException(
                        "Cannot delete user '" + user.getFullName() + "' because they are currently managing the following department(s): ["
                                + deptNames + "]. Please relieve them from their managerial duties or reassign the department manager first."
                );

            }
        }

        // 3. It is now completely safe to drop the manager record from MySQL
        userRepository.delete(user);
    }

    public DepartmentResponse updateDepartmentManager(Long departmentId, UpdateManagerRequest request){
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        User newManager = userRepository.findById(request.newManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.newManagerId()));

        if (newManager.getRole() != Role.ROLE_MANAGER) {
            throw new IllegalArgumentException("The selected user does not have the required MANAGER role.");
        }

        department.setManager(newManager);
        return departmentMapper.toResponseDTO(departmentRepository.save(department));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllManagersByAdmin(){
        Role managerRole = Role.ROLE_MANAGER;
        return userRepository.findByRole(managerRole)
                .stream()
                .map(userResponseMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getAllUsersByManager(Long departmentId){
        return userRepository.findByDepartmentId(departmentId)
                .stream()
                .map(userResponseMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
