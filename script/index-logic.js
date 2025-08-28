let countdownStarted = false;
let verificationCompleted = false;
let countdownTimer = null;
let verifyTimer = null;
let verifyProgress = 0;
let currentVerificationCode = '';
const VERIFY_DURATION = 5; // Reduced from 30 to 5 seconds

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
    
    // Close current modal and show simplified verification
    setTimeout(() => {
      closeVerifyModal();
      showSimplifiedVerification();
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

// Simplified verification without fake ads
function showSimplifiedVerification() {
  const modal = document.createElement('div');
  modal.className = 'verify-modal';
  modal.innerHTML = `
    <div class="verify-container">
      <h2 class="verify-header">🛡️ Final Verification</h2>
      <div class="verify-content">
        <div class="verification-icon" style="font-size: 48px; margin: 20px 0;">⏳</div>
        <div class="verification-message">Verifying human status...</div>
        <div class="verify-timer" id="verifyTimer">
          Completing verification: ${VERIFY_DURATION}s remaining
        </div>
        <div class="verify-progress">
          <div class="verify-progress-bar" id="verifyProgressBar"></div>
        </div>
        <button class="continue-btn" id="continueBtn" disabled>
          🔄 Processing... (${VERIFY_DURATION}s)
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
    timerDisplay.textContent = `Completing verification: ${remaining}s remaining`;
    continueBtn.textContent = `🔄 Processing... (${remaining}s)`;
    
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

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfx4S7Hww-JpovtYcFvE7Jfl1mhSxRRyc",
  authDomain: "trashinsta-review.firebaseapp.com",
  projectId: "trashinsta-review",
  storageBucket: "trashinsta-review.firebasestorage.app",
  messagingSenderId: "564393414993",
  appId: "1:564393414993:web:67e4b60f91d6e0bab50370",
  measurementId: "G-M3XGVJYX22"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('ratingText');
const ratingInput = document.getElementById('rating');
const submitBtn = document.getElementById('submitBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const reviewsContainer = document.getElementById('reviewsContainer');

// Global Variables
let currentRating = 0;

// Rating Text Messages
const ratingTexts = {
  0: 'Click to rate',
  1: 'Poor - Needs significant improvement',
  2: 'Fair - Below expectations', 
  3: 'Good - Meets expectations',
  4: 'Very Good - Exceeds expectations',
  5: 'Excellent - Outstanding!'
};

// Star Rating System
function initializeStarRating() {
  stars.forEach(star => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.dataset.rating);
      ratingInput.value = currentRating;
      updateStarRating();
    });

    star.addEventListener('mouseenter', () => {
      const hoverRating = parseInt(star.dataset.rating);
      highlightStars(hoverRating);
    });
  });

  const starRatingElement = document.getElementById('starRating');
  if (starRatingElement) {
    starRatingElement.addEventListener('mouseleave', () => {
      updateStarRating();
    });
  }
}

function highlightStars(rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
  if (ratingText) {
    ratingText.textContent = ratingTexts[rating];
  }
}

function updateStarRating() {
  highlightStars(currentRating);
}

// Generate Stars for Display
function generateStars(rating) {
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHtml += '★';
    } else {
      starsHtml += '☆';
    }
  }
  return starsHtml;
}

// Format Date - Fixed to handle various timestamp formats
function formatDate(timestamp) {
  if (!timestamp) return 'Just now';
  
  let date;
  try {
    if (timestamp && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      // String or number timestamp
      date = new Date(timestamp);
    } else {
      return 'Just now';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Just now';
  }
}

// Display Reviews - Enhanced error handling and debugging
function displayReviews() {
  console.log('Starting to fetch reviews...');
  
  if (!reviewsContainer) {
    console.error('Reviews container element not found!');
    return;
  }

  // Show loading message
  reviewsContainer.innerHTML = '<div class="no-reviews"><p>Loading reviews...</p></div>';

  db.collection("feedback")
    .orderBy("timestamp", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      console.log('Query completed. Document count:', querySnapshot.size);
      
      reviewsContainer.innerHTML = '';
      
      if (querySnapshot.empty) {
        console.log('No documents found in feedback collection');
        reviewsContainer.innerHTML = `
          <div class="no-reviews">
            <p>No feedback yet. Be the first to share your thoughts!</p>
          </div>
        `;
        return;
      }

      querySnapshot.forEach((doc) => {
        const review = doc.data();
        console.log('Review data:', review);
        const reviewElement = createReviewElement(review);
        reviewsContainer.appendChild(reviewElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching reviews: ", error);
      reviewsContainer.innerHTML = `
        <div class="no-reviews">
          <p>Unable to load reviews: ${error.message}</p>
          <button onclick="displayReviews()" style="margin-top: 10px; padding: 5px 10px; background: rgba(225, 48, 108, 0.2); border: 1px solid rgba(225, 48, 108, 0.5); color: white; border-radius: 5px; cursor: pointer;">Try Again</button>
        </div>
      `;
    });
}

// Create Review Element - Enhanced with better error handling
function createReviewElement(review) {
  const reviewDiv = document.createElement('div');
  reviewDiv.className = 'review-item';
  
  // Safely get review properties with fallbacks
  const userName = review.user_name || review.userName || 'Anonymous';
  const subject = review.subject || 'General Feedback';
  const message = review.message || 'No message provided';
  const rating = parseInt(review.rating) || 0;
  const timestamp = review.timestamp || review.createdAt || new Date();
  
  reviewDiv.innerHTML = `
    <div class="review-header">
      <span class="review-author">${escapeHtml(userName)}</span>
      <span class="review-rating">${generateStars(rating)}</span>
    </div>
    <div class="review-subject">${escapeHtml(subject)}</div>
    <div class="review-message">${escapeHtml(message)}</div>
    <div class="review-date">${formatDate(timestamp)}</div>
  `;
  
  return reviewDiv;
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Form Submission - Enhanced with better error handling
function initializeForm() {
  const formElement = document.getElementById('feedbackForm');
  if (!formElement) {
    console.error('Feedback form not found!');
    return;
  }

  // Set device/browser info
  const userAgentInput = document.getElementById('user_agent');
  const timestampInput = document.getElementById('timestamp');
  
  if (userAgentInput) userAgentInput.value = navigator.userAgent;
  if (timestampInput) timestampInput.value = new Date().toISOString();

  // Form submission handler
  formElement.addEventListener('submit', function(e) {
    e.preventDefault();
    
    console.log('Form submitted, current rating:', currentRating);
    
    // Validate rating
    if (currentRating === 0) {
      alert('Please provide a rating before submitting your feedback.');
      return;
    }
    
    // Hide previous messages
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
      submitBtn.innerHTML = '<div class="loading-spinner" style="display: inline-block;"></div> Sending...';
    }
    
    // Prepare feedback data
    const feedbackData = {
      user_name: document.getElementById('user_name')?.value || 'Anonymous',
      user_email: document.getElementById('user_email')?.value || '',
      subject: document.getElementById('subject')?.value || 'General Feedback',
      rating: currentRating,
      message: document.getElementById('message')?.value || '',
      user_agent: navigator.userAgent,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      website_description: "Trash-Insta Analytics - Instagram analytics platform for content creators",
      created_at: new Date().toISOString() // Backup timestamp
    };

    console.log('Saving feedback data:', feedbackData);

    // Save to Firebase
    db.collection("feedback").add(feedbackData)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        
        // Show success message
        if (successMessage) {
          successMessage.style.display = 'block';
          successMessage.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset form
        formElement.reset();
        currentRating = 0;
        if (ratingInput) ratingInput.value = 0;
        updateStarRating();
        
        // Refresh displayed reviews after a short delay
        setTimeout(() => {
          displayReviews();
        }, 1000);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        
        // Show error message
        if (errorMessage) {
          errorMessage.textContent = `Error: ${error.message}`;
          errorMessage.style.display = 'block';
          errorMessage.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .finally(() => {
        // Reset button state
        if (submitBtn) {
          submitBtn.disabled = false;
          if (loadingSpinner) loadingSpinner.style.display = 'none';
          submitBtn.innerHTML = '🚀 Send Feedback';
        }
      });
  });
}

// Debug function to test Firebase connection
function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  db.collection("feedback").limit(1).get()
    .then((querySnapshot) => {
      console.log('Firebase connection successful. Document count:', querySnapshot.size);
      if (querySnapshot.size > 0) {
        querySnapshot.forEach((doc) => {
          console.log('Sample document:', doc.id, doc.data());
        });
      }
    })
    .catch((error) => {
      console.error('Firebase connection error:', error);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing...');
  
  // Test Firebase connection first
  testFirebaseConnection();
  
  // Initialize components
  initializeStarRating();
  initializeForm();
  
  // Load reviews with a small delay to ensure Firebase is ready
  setTimeout(() => {
    displayReviews();
  }, 500);
});

// Make displayReviews globally accessible for retry button
window.displayReviews = displayReviews;
