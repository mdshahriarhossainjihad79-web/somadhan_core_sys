<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <meta name="description" content="Log In - Somadhan POS || Smart POS Software">
  <meta name="author" content="Somadhan Intellitech">
  <meta name="keywords" content="somadhan, pos, somadhan-pos, software, smart, technology, business, ltd">

  <title>Log In - Somadhan POS || Smart POS Software</title>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- core:css -->
  <link rel="stylesheet" href="../../../assets/vendors/core/core.css">

  <!-- inject:css -->
  <link rel="stylesheet" href="../../../assets/fonts/feather-font/css/iconfont.css">
  <link rel="stylesheet" href="../../../assets/vendors/flag-icon-css/css/flag-icon.min.css">

  <!-- Layout styles -->
  <link rel="stylesheet" href="../../../assets/css/demo1/style.css">

  <link rel="shortcut icon" href="../../../assets/images/favicon.svg" />

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body,
    html {
      height: 100%;
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .background-animation {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
    }

    .particle {
      position: absolute;
      border-radius: 50%;
      background: rgba(64, 141, 255, 0.2);
      animation: float 15s infinite linear;
    }

    @keyframes float {
      0% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) translateX(100px);
        opacity: 0;
      }
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      width: 100%;
      max-width: 480px;
      animation: fadeIn 0.8s ease-in-out;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 1;
    }

    .auth-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #408dff, #0664f0, #408dff);
      background-size: 200% 100%;
      animation: shimmer 3s infinite linear;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      background: linear-gradient(135deg, rgba(64, 141, 255, 0.2) 0%, rgba(6, 100, 240, 0.2) 100%);
      text-align: center;
      padding: 40px 20px;
      color: #fff;
      position: relative;
      overflow: hidden;
    }

    .login-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
      animation: pulse 8s infinite linear;
    }

    @keyframes pulse {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .logo-container {
      position: relative;
      display: inline-block;
      margin-bottom: 15px;
    }

    .logo-container::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 10%;
      width: 80%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #408dff, transparent);
      border-radius: 50%;
    }

    .login-header img {
      width: 80px;
      margin-bottom: 10px;
      filter: drop-shadow(0 0 10px rgba(64, 141, 255, 0.5));
    }

    .login-header h4 {
      font-weight: 600;
      letter-spacing: 0.5px;
      font-size: 1.8rem;
      text-shadow: 0 0 10px rgba(64, 141, 255, 0.5);
    }

    form {
      padding: 40px 35px;
      background: rgba(255, 255, 255, 0.05);
    }

    .input_design {
      border-radius: 15px;
      padding: 16px 50px 16px 20px;
      border: 1.5px solid rgba(64, 141, 255, 0.3);
      font-size: 15px;
      color: #fff;
      width: 100%;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(5px);
    }

    .input_design::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .input_design:focus {
      border-color: #408dff;
      box-shadow: 0 0 15px rgba(64, 141, 255, 0.5);
      outline: none;
      background: rgba(255, 255, 255, 0.1);
    }

    .input-wrapper {
      position: relative;
      margin-bottom: 25px;
    }

    .input-icon {
      position: absolute;
      top: 50%;
      right: 18px;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .input-icon:hover {
      color: #408dff;
    }

    .custom_btn {
      width: 100%;
      background: linear-gradient(135deg, #408dff, #0664f0);
      color: #fff;
      font-weight: 600;
      border: none;
      border-radius: 15px;
      padding: 16px 0;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-size: 1rem;
      letter-spacing: 0.5px;
    }

    .custom_btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .custom_btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(64, 141, 255, 0.4);
    }

    .custom_btn:hover::before {
      left: 100%;
    }

    .form-check {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      margin-bottom: 25px;
    }

    .form-check-label {
      color: rgba(255, 255, 255, 0.8);
      margin-left: 8px;
    }

    .form-check-input {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(64, 141, 255, 0.5);
    }

    .form-check-input:checked {
      background-color: #408dff;
      border-color: #408dff;
    }

    .forgot-link {
      text-decoration: none;
      color: #408dff;
      transition: all 0.3s ease;
      position: relative;
    }

    .forgot-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background: #408dff;
      transition: width 0.3s ease;
    }

    .forgot-link:hover {
      color: #66a3ff;
    }

    .forgot-link:hover::after {
      width: 100%;
    }

    .text_custom_header {
      text-align: center;
      color: #fff;
      margin-bottom: 30px;
      font-weight: 400;
      font-size: 1.1rem;
      text-shadow: 0 0 10px rgba(64, 141, 255, 0.5);
    }

    .error-message {
      color: #ff6b6b;
      font-size: 0.85rem;
      margin-top: 5px;
      display: block;
    }

    .footer-text {
      text-align: center;
      margin-top: 25px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
    }

    .glow {
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(64, 141, 255, 0.3) 0%, rgba(64, 141, 255, 0) 70%);
      filter: blur(20px);
      z-index: -1;
      animation: glowMove 15s infinite alternate ease-in-out;
    }

    @keyframes glowMove {
      0% {
        transform: translate(-100px, -100px);
      }
      100% {
        transform: translate(100px, 100px);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 576px) {
      .auth-card {
        max-width: 90%;
        margin: 0 20px;
      }
      
      form {
        padding: 30px 25px;
      }
      
      .login-header {
        padding: 30px 20px;
      }
    }
  </style>
</head>

<body>
  <div class="background-animation" id="particles"></div>
  <div class="glow" style="top: 10%; left: 10%;"></div>
  <div class="glow" style="bottom: 10%; right: 10%; animation-delay: -5s;"></div>

  <div class="auth-card">
    <div class="login-header">
      <div class="logo-container">
        <img src="{{ 'assets/logo.png' }}" alt="Somadhan POS">
      </div>
      <h4>Somadhan POS</h4>
    </div>

    <form method="POST" action="{{ route('login') }}">
      @csrf
      <h5 class="text_custom_header">Welcome back! Please log in to continue</h5>

      <div class="input-wrapper">
        <input type="email" class="input_design" name="email" id="userEmail" placeholder="Enter your email">
        <i data-feather="mail" class="input-icon"></i>
        <x-input-error :messages="$errors->get('email')" class="error-message" />
      </div>

      <div class="input-wrapper">
        <input type="password" class="input_design" id="userPassword" name="password"
          placeholder="Enter your password">
        <div id="togglePassword"><i data-feather="eye" class="input-icon"></i></div>
        <x-input-error :messages="$errors->get('password')" class="error-message" />
      </div>

      <div class="form-check mb-4">
        <div class="d-flex align-items-center">
          <input type="checkbox" id="authCheck" class="form-check-input">
          <label for="authCheck" class="form-check-label">Remember me</label>
        </div>
        <a href="#" class="forgot-link">Forgot Password?</a>
      </div>

      <button type="submit" class="custom_btn">Login</button>
      
      <p class="footer-text">© 2023 Somadhan POS. All rights reserved.</p>
    </form>
  </div>

  <!-- JS -->
  <script src="../../../assets/vendors/core/core.js"></script>
  <script src="../../../assets/vendors/feather-icons/feather.min.js"></script>
  <script src="../../../assets/js/template.js"></script>

  <script>
    window.onload = function () {
      feather.replace();

      // Create floating particles
      const particlesContainer = document.getElementById('particles');
      const particleCount = 20;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const animationDelay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;
        
        particlesContainer.appendChild(particle);
      }

      const passwordInput = document.getElementById('userPassword');
      const togglePassword = document.getElementById('togglePassword');
      const icon = togglePassword.querySelector('i');

      togglePassword.addEventListener('click', function () {
        const isPasswordVisible = passwordInput.getAttribute('type') === 'text';
        passwordInput.setAttribute('type', isPasswordVisible ? 'password' : 'text');
        icon.setAttribute('data-feather', isPasswordVisible ? 'eye' : 'eye-off');
        feather.replace();
      });
    };
  </script>
</body>

</html>