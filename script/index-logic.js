    let countdownStarted = false;
    let verificationCompleted = false;
    let countdownTimer = null;
    let verifyTimer = null;
    let verifyProgress = 0;
    let currentVerificationCode = '';
    const VERIFY_DURATION = 30;

    // Generate random verification code
    function generateVerificationCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    // Show verify button when page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.getElementById('verifyBtn').classList.add('show');
      }, 2000);
    });

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
              <div class="verify-play-icon">my ads= </div>
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



