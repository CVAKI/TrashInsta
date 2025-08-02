 let followers = [];
    let following = [];
    let notFollowingBack = [];
    let adWatched = false;
    let adTimer = null;
    let adProgress = 0;
    const AD_DURATION = 30; // 30 seconds

    // File input handlers
    document.getElementById('followersFile').addEventListener('change', function(e) {
      const label = document.getElementById('followersLabel');
      if (e.target.files[0]) {
        label.textContent = `✅ ${e.target.files[0].name}`;
        label.classList.add('has-file');
      } else {
        label.textContent = 'Choose followers.html file';
        label.classList.remove('has-file');
      }
      checkFilesAndEnableButton();
    });

    document.getElementById('followingFile').addEventListener('change', function(e) {
      const label = document.getElementById('followingLabel');
      if (e.target.files[0]) {
        label.textContent = `✅ ${e.target.files[0].name}`;
        label.classList.add('has-file');
      } else {
        label.textContent = 'Choose following.html file';
        label.classList.remove('has-file');
      }
      checkFilesAndEnableButton();
    });

    function checkFilesAndEnableButton() {
      const followersFile = document.getElementById('followersFile').files[0];
      const followingFile = document.getElementById('followingFile').files[0];
      const analyzeBtn = document.getElementById('analyzeBtn');
      
      if (followersFile && followingFile) {
        analyzeBtn.disabled = false;
        analyzeBtn.style.opacity = '1';
      } else {
        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = '0.6';
      }
    }

    function extractUsernamesFromHTML(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const anchors = doc.querySelectorAll('a');
      return Array.from(anchors).map(a => a.textContent.trim()).filter(Boolean);
    }

    function handleFileUpload(fileInput, callback) {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => callback(reader.result);
      reader.readAsText(file);
    }

    function showLoading() {
      document.getElementById('results').innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <div>Analyzing your Instagram data...</div>
        </div>
      `;
    }

    function analyze() {
      if (!adWatched) {
        showAdModal();
        return;
      }
      
      showLoading();
      followers = [];
      following = [];
      notFollowingBack = [];

      handleFileUpload(document.getElementById('followersFile'), followerHTML => {
        followers = extractUsernamesFromHTML(followerHTML);

        handleFileUpload(document.getElementById('followingFile'), followingHTML => {
          following = extractUsernamesFromHTML(followingHTML);
          notFollowingBack = following.filter(user => !followers.includes(user));
          
          setTimeout(() => {
            renderResults();
          }, 1500); // Add delay for better UX
        });
      });
    }

    function showAdModal() {
      const adModal = document.createElement('div');
      adModal.className = 'ad-modal';
      adModal.innerHTML = `
        <div class="ad-container">
          <h2 class="ad-header">🎬 Watch Advertisement</h2>
          <div class="ad-content">
            <div class="ad-video-placeholder">
              <div class="play-icon">my ads ================================================================</div>
            <div class="ad-title">Premium Instagram Analytics Tool</div>
            <div class="ad-description">
              Discover advanced features for Instagram growth! 
              Track followers, engagement rates, and optimize your content strategy.
            </div>
            <div class="ad-timer" id="adTimer">
              Loading: ${AD_DURATION}s remaining
            </div>
            <div class="ad-progress">
              <div class="ad-progress-bar" id="adProgressBar"></div>
            </div>
            <button class="skip-btn" id="skipBtn" disabled>
              ⏭️ Skip Ad (${AD_DURATION}s)
            </button>
            <button class="close-ad-btn" onclick="closeAdModal()">
              ❌ Close (Watch Required)
            </button>
          </div>
          <div class="ad-warning">
            ⚠️ You must watch the complete advertisement to access the analysis tool.
          </div>
        </div>
      `;
      
      document.body.appendChild(adModal);
      startAdTimer();
    }

    function startAdTimer() {
      adProgress = 0;
      const progressBar = document.getElementById('adProgressBar');
      const timerDisplay = document.getElementById('adTimer');
      const skipBtn = document.getElementById('skipBtn');
      
      adTimer = setInterval(() => {
        adProgress++;
        const remaining = AD_DURATION - adProgress;
        const progressPercent = (adProgress / AD_DURATION) * 100;
        
        progressBar.style.width = progressPercent + '%';
        timerDisplay.textContent = `Please watch: ${remaining}s remaining`;
        skipBtn.textContent = `⏭️ Skip Ad (${remaining}s)`;
        
        if (adProgress >= AD_DURATION) {
          clearInterval(adTimer);
          skipBtn.disabled = false;
          skipBtn.classList.add('enabled');
          skipBtn.textContent = '✅ Start Analysis';
          skipBtn.onclick = () => {
            adWatched = true;
            closeAdModal();
            analyze();
          };
          timerDisplay.textContent = '🎉 Loading completed!';
          timerDisplay.style.background = 'rgba(40, 167, 69, 0.2)';
          timerDisplay.style.borderColor = '#28a745';
          timerDisplay.style.color = '#28a745';
        }
      }, 1000);
    }

    function closeAdModal() {
      const modal = document.querySelector('.ad-modal');
      if (modal) {
        if (!adWatched) {
          // Reset the ad if they close it early
          clearInterval(adTimer);
          adProgress = 0;
          
          // Show warning message
          const warning = document.createElement('div');
          warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #dc3545, #e74c3c);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1001;
            animation: slideInRight 0.5s ease-out;
            box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
          `;
          warning.innerHTML = '⚠️ Please watch the complete ad to access analysis!';
          document.body.appendChild(warning);
          
          setTimeout(() => {
            if (warning.parentNode) {
              warning.parentNode.removeChild(warning);
            }
          }, 3000);
        }
        
        modal.style.animation = 'modalSlideOut 0.3s ease-in-out forwards';
        setTimeout(() => {
          if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
        }, 300);
      }
    }

    function renderResults() {
      const results = document.getElementById('results');
      
      if (notFollowingBack.length === 0) {
        results.innerHTML = `
          <div class="results-section">
            <div class="success-message">
              🎉 Congratulations! Everyone you follow follows you back!
            </div>
          </div>
        `;
        return;
      }

      results.innerHTML = `
        <div class="results-section">
          <div class="results-header">
            <h2 class="results-title">Non-Followers Detected</h2>
            <div class="count-display" id="countDisplay">${notFollowingBack.length}</div>
            <p>People who don't follow you back</p>
          </div>
          <div class="users-grid" id="usersGrid"></div>
        </div>
      `;

      const usersGrid = document.getElementById('usersGrid');
      
      notFollowingBack.forEach((username, index) => {
        setTimeout(() => {
          const userCard = document.createElement('div');
          userCard.className = 'user-card';
          userCard.innerHTML = `
            <div class="username">@${username}</div>
            <div class="unfollow-text">Click to view profile</div>
          `;
          
          userCard.onclick = () => {
            window.open(`https://instagram.com/${username}`, '_blank');
            userCard.style.animation = 'cardSlideOut 0.3s ease-in-out forwards';
            
            setTimeout(() => {
              usersGrid.removeChild(userCard);
              notFollowingBack = notFollowingBack.filter(u => u !== username);
              document.getElementById('countDisplay').textContent = notFollowingBack.length;
              
              if (notFollowingBack.length === 0) {
                results.innerHTML = `
                  <div class="results-section">
                    <div class="success-message">
                      🎉 All profiles checked! Great job cleaning up your following list!
                    </div>
                  </div>
                `;
              }
            }, 300);
          };
          
          usersGrid.appendChild(userCard);
        }, index * 100); // Stagger the animations
      });
    }

    // Add CSS for additional animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cardSlideOut {
        to { opacity: 0; transform: translateX(100px) scale(0.8); }
      }
      @keyframes modalSlideOut {
        to { opacity: 0; transform: scale(0.8) translateY(-50px); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);


