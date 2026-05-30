package com.roomrental.security;

import com.roomrental.entity.User;
import com.roomrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String soDienThoai) throws UsernameNotFoundException {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng: " + soDienThoai));

        return new org.springframework.security.core.userdetails.User(
                user.getSoDienThoai(),
                user.getMatKhau(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getVaiTro().name()))
        );
    }
}
