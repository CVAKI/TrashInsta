
    let countdownStarted = false;
    let verificationCompleted = false;
    let countdownTimer = null;
    let verifyTimer = null;
    let verifyProgress = 0;
    let currentVerificationCode = '';
    const VERIFY_DURATION = 30;

    // GDPR Compliance Status Management
    function updateGDPRStatus() {
      const statusElement = document.getElementById('gdprStatus');
      
      // Check if Cookiebot is loaded and what consent state we're in
      if (typeof Cookiebot !== 'undefined' && Cookiebot.consent) {
        if (Cookiebot.consent.marketing) {
          statusElement.textContent = '✅ GDPR Compliant - Marketing cookies accepted';
          statusElement.className = 'gdpr-status show';
        } else if (Cookiebot.consent.necessary) {
          statusElement.textContent = '⚠️ Essential cookies only - Marketing blocked';
          statusElement.className = 'gdpr-status show warning';
        } else {
          statusElement.textContent = '🔄 Waiting for cookie consent...';
          statusElement.className = 'gdpr-status show warning';
        }
      } else {
        statusElement.textContent = '🔄 Loading cookie consent system...';
        statusElement.className = 'gdpr-status show warning';
      }
      
      // Hide status after 5 seconds
      setTimeout(() => {
        statusElement.classList.remove('show');
      }, 5000);
    }

    // Initialize GDPR status check
    window.addEventListener('load', () => {
      updateGDPRStatus();
      
      // Show verify button
      setTimeout(() => {
        document.getElementById('verifyBtn').classList.add('show');
      }, 2000);
    });

    // Listen for Cookiebot consent changes
    window.addEventListener('CookiebotOnConsentReady', function() {
      updateGDPRStatus();
      
      // Update Google Consent Mode based on Cookiebot consent
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'ad_storage': Cookiebot.consent.marketing ? 'granted' : 'denied',
          'ad_user_data': Cookiebot.consent.marketing ? 'granted' : 'denied', 
          'ad_personalization': Cookiebot.consent.marketing ? 'granted' : 'denied',
          'analytics_storage': Cookiebot.consent.statistics ? 'granted' : 'denied',
          'functionality_storage': Cookiebot.consent.preferences ? 'granted' : 'denied',
          'personalization_storage': Cookiebot.consent.preferences ? 'granted' : 'denied'
        });
        
        console.log('Google Consent Mode updated:', {
          marketing: Cookiebot.consent.marketing,
          statistics: Cookiebot.consent.statistics,
          preferences: Cookiebot.consent.preferences,
          necessary: Cookiebot.consent.necessary
        });
      }
    });

    // Also listen for consent changes (when user changes their mind)
    window.addEventListener('CookiebotOnConsentChanged', function() {
      updateGDPRStatus();
      
      // Update Google Consent Mode
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'ad_storage': Cookiebot.consent.marketing ? 'granted' : 'denied',
          'ad_user_data': Cookiebot.consent.marketing ? 'granted' : 'denied',
          'ad_personalization': Cookiebot.consent.marketing ? 'granted' : 'denied', 
          'analytics_storage': Cookiebot.consent.statistics ? 'granted' : 'denied',
          'functionality_storage': Cookiebot.consent.preferences ? 'granted' : 'denied',
          'personalization_storage': Cookiebot.consent.preferences ? 'granted' : 'denied'
        });
      }
    });

    // Generate random verification code
    function generateVerificationCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    // Scroll detection
    window.addEventListener('scroll', () => {
      const scrollIndicator = document.getElementById('scrollIndicator');
      const bottomSection = document.getElementById('bottomSection');
      const countdownContainer = document.getElementById('countdownContainer');
      
      // Hide scroll indicator after scrolling
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
      } else {
        scrollIndicator.style.opacity = '1';
      }

      // Check if user reached bottom
      const rect = bottomSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight && !countdownStarted) {
        countdownStarted = true;
        countdownContainer.classList.add('show');
        startCountdown();
      }
    });

    function startCountdown() {
      let count = 20;
      const timerElement = document.getElementById('countdownTimer');
      const goUpBtn = document.getElementById('goUpBtn');
      const verificationCodeContainer = document.getElementById('verificationCodeContainer');
      const verificationCodeDisplay = document.getElementById('verificationCodeDisplay');
      
      countdownTimer = setInterval(() => {
        count--;
        timerElement.textContent = count;
        
        if (count <= 0) {
          clearInterval(countdownTimer);
          timerElement.textContent = '0';
          
          // Generate and show verification code
          currentVerificationCode = generateVerificationCode();
          verificationCodeDisplay.textContent = currentVerificationCode;
          verificationCodeContainer.classList.add('show');
          
          // Show go up button
          setTimeout(() => {
            goUpBtn.classList.add('show');
          }, 500);
        }
      }, 1000);
    }

    function copyVerificationCode() {
      navigator.clipboard.writeText(currentVerificationCode).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        }, 2000);
      }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = currentVerificationCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    }

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    function showVerifyModal() {
      if (!currentVerificationCode) {
        alert('Please scroll down to get your verification code first!');
        return;
      }

      const modal = document.createElement('div');
      modal.className = 'verify-modal';
      modal.innerHTML = `
        <div class="verify-container">
          <h2 class="verify-header">🛡️ Human Verification</h2>
          <p style="color: #888; margin-bottom: 20px;">Enter the verification code you obtained by scrolling down</p>
          
          <input type="text" 
                 class="verify-code-input" 
                 id="verifyCodeInput" 
                 placeholder="Enter 6-digit code" 
                 maxlength="6">
          
          <div class="error-message" id="errorMessage">
            ❌ Invalid verification code. Please try again.
          </div>
          
          <div class="success-message" id="successMessage">
            ✅ Verification successful! Redirecting...
          </div>
          
          <div>
            <button class="verify-submit-btn" onclick="verifyCode()">
              🔍 Verify Code
            </button>
            <button class="close-modal-btn" onclick="closeVerifyModal()">
              ❌ Close
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Focus on input
      setTimeout(() => {
        document.getElementById('verifyCodeInput').focus();
      }, 100);

      // Allow Enter key to submit
      document.getElementById('verifyCodeInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          verifyCode();
        }
      });
    }

    function verifyCode() {
      const inputCode = document.getElementById('verifyCodeInput').value.toUpperCase();
      const errorMessage = document.getElementById('errorMessage');
      const successMessage = document.getElementById('successMessage');
      
      if (inputCode === currentVerificationCode) {
        // Correct code
        errorMessage.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Close current modal and show ad verification
        setTimeout(() => {
          closeVerifyModal();
          showAdVerificationModal();
        }, 1500);
      } else {
        // Wrong code
        successMessage.style.display = 'none';
        errorMessage.style.display = 'block';
        
        // Shake the input
        const input = document.getElementById('verifyCodeInput');
        input.style.borderColor = '#ff4d4d';
        input.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
          input.style.borderColor = 'rgba(225, 48, 108, 0.3)';
          input.style.animation = '';
          errorMessage.style.display = 'none';
        }, 3000);
      }
    }

    function closeVerifyModal() {
      const modal = document.querySelector('.verify-modal');
      if (modal) {
        modal.remove();
      }
    }

    function showAdVerificationModal() {
      const modal = document.createElement('div');
      modal.className = 'verify-modal';
      modal.innerHTML = `
        <div class="verify-container">
          <h2 class="verify-header">🛡️ Human Verification</h2>
          <div class="verify-ad-content">
            <div class="verify-ad-placeholder">
              <div class="verify-play-icon">▶️</div>
            </div>
            <div class="ad-title">Verify You're Human</div>
            <div class="ad-description">
              Watch this short advertisement to verify you're a real person 
              and gain access to our premium Instagram analytics tool.
            </div>
            <div class="verify-timer" id="verifyTimer">
              Verification: ${VERIFY_DURATION}s remaining
            </div>
            <div class="verify-progress">
              <div class="verify-progress-bar" id="verifyProgressBar"></div>
            </div>
            <button class="continue-btn" id="continueBtn" disabled>
              🔄 Verifying... (${VERIFY_DURATION}s)
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      startVerifyTimer();
    }

    function startVerifyTimer() {
      verifyProgress = 0;
      const progressBar = document.getElementById('verifyProgressBar');
      const timerDisplay = document.getElementById('verifyTimer');
      const continueBtn = document.getElementById('continueBtn');
      
      verifyTimer = setInterval(() => {
        verifyProgress++;
        const remaining = VERIFY_DURATION - verifyProgress;
        const progressPercent = (verifyProgress / VERIFY_DURATION) * 100;
        
        progressBar.style.width = progressPercent + '%';
        timerDisplay.textContent = `Verification: ${remaining}s remaining`;
        continueBtn.textContent = `🔄 Verifying... (${remaining}s)`;
        
        if (verifyProgress >= VERIFY_DURATION) {
          clearInterval(verifyTimer);
          verificationCompleted = true;
          continueBtn.disabled = false;
          continueBtn.classList.add('enabled');
          continueBtn.textContent = '✅ Verification Complete - Continue';
          continueBtn.onclick = () => {
            // Replace with your actual next page URL
            const nextPageUrl = 'public/trashinsta.html';
            window.location.href = nextPageUrl;
          };
          timerDisplay.textContent = '🎉 Human verification completed!';
          timerDisplay.style.background = 'rgba(40, 167, 69, 0.2)';
          timerDisplay.style.borderColor = '#28a745';
          timerDisplay.style.color = '#28a745';
        }
      }, 1000);
    }

    // Prevent access to main page without verification
    window.addEventListener('beforeunload', (e) => {
      if (!verificationCompleted) {
        e.preventDefault();
        e.returnValue = 'Please complete human verification first!';
      }
    });

    // Privacy Policy Modal
    function showPrivacyModal() {
      const modal = document.createElement('div');
      modal.className = 'privacy-modal';
      modal.innerHTML = `
        <div class="privacy-content">
          <button class="close-privacy-btn" onclick="closePrivacyModal()">×</button>
          <h2 class="privacy-header">🛡️ Privacy Policy</h2>
          
          <div class="privacy-section">
            <h3>Information We Collect</h3>
            <p class="privacy-text">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your Instagram username, 
              email address, and usage analytics.
            </p>
          </div>

          <div class="privacy-section">
            <h3>How We Use Your Information</h3>
            <p class="privacy-text">
              We use the information we collect to provide, maintain, and improve our Instagram 
              analytics services, communicate with you, and ensure the security of our platform.
            </p>
          </div>

          <div class="privacy-section">
            <h3>Cookies and Tracking</h3>
            <p class="privacy-text">
              We use cookies and similar technologies to analyze usage patterns, improve user 
              experience, and provide personalized content. You can manage your cookie preferences 
              using our cookie consent tool.
            </p>
          </div>

          <div class="privacy-section">
            <h3>Data Security</h3>
            <p class="privacy-text">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div class="privacy-section">
            <h3>Contact Us</h3>
            <p class="privacy-text">
              If you have any questions about this Privacy Policy, please contact us through 
              our feedback form or support channels.
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    function closePrivacyModal() {
      const modal = document.querySelector('.privacy-modal');
      if (modal) {
        modal.remove();
      }
    }

    function showTermsModal() {
      const modal = document.createElement('div');
      modal.className = 'privacy-modal';
      modal.innerHTML = `
        <div class="privacy-content">
          <button class="close-privacy-btn" onclick="closeTermsModal()">×</button>
          <h2 class="privacy-header">📋 Terms of Service</h2>
          
          <div class="privacy-section">
            <h3>Acceptance of Terms</h3>
            <p class="privacy-text">
              By accessing and using Trash-Insta analytics platform, you accept and agree to be 
              bound by the terms and provision of this agreement.
            </p>
          </div>

          <div class="privacy-section">
            <h3>Use License</h3>
            <p class="privacy-text">
              Permission is granted to temporarily access our platform for personal, 
              non-commercial transitory viewing only. This license shall automatically 
              terminate if you violate any of these restrictions.
            </p>
          </div>

          <div class="privacy-section">
            <h3>Instagram Compliance</h3>
            <p class="privacy-text">
              Our service operates in compliance with Instagram's Terms of Service and API 
              guidelines. Users must ensure their Instagram accounts comply with Instagram's 
              community guidelines.
            </p>
          </div>

          <div class="privacy-section">
            <h3>Limitation of Liability</h3>
            <p class="privacy-text">
              Trash-Insta shall not be liable for any damages arising from the use or inability 
              to use our analytics platform, including but not limited to data accuracy or 
              service availability.
            </p>
          </div>

          <div class="privacy-section">
            <h3>Service Modifications</h3>
            <p class="privacy-text">
              We reserve the right to modify or discontinue our service at any time without 
              notice. We shall not be liable for any modification, suspension, or discontinuance 
              of the service.
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    function closeTermsModal() {
      const modal = document.querySelector('.privacy-modal');
      if (modal) {
        modal.remove();
      }
    }

    // Add some debugging for GDPR compliance
    console.log('GDPR Compliance System Loaded');
    console.log('Google Consent Mode initialized with default DENIED state');
    console.log('Cookiebot will handle consent updates automatically');
