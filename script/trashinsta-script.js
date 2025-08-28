let followers = [];
let following = [];
let notFollowingBack = [];
let currentMode = 'zip'; // 'zip' or 'manual'

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupFileHandlers();
    initializeDragAndDrop();
});

function setupFileHandlers() {
    // ZIP file handler
    document.getElementById('zipFile').addEventListener('change', function(e) {
        const label = document.getElementById('zipLabel');
        const file = e.target.files[0];
        
        if (file) {
            if (file.name.toLowerCase().endsWith('.zip')) {
                label.classList.add('has-file');
                label.innerHTML = `
                    <div class="upload-icon">✅</div>
                    <div class="upload-text">
                        <span class="main-text">${file.name}</span>
                        <span class="sub-text">Ready to analyze</span>
                    </div>
                `;
                enableAnalyzeButton();
            } else {
                showError('Please select a ZIP file');
                resetZipInput();
            }
        } else {
            resetZipInput();
        }
    });

    // Manual file handlers
    document.getElementById('followersFile').addEventListener('change', function(e) {
        handleManualFile(e, 'followersLabel', 'followers.html file');
    });

    document.getElementById('followingFile').addEventListener('change', function(e) {
        handleManualFile(e, 'followingLabel', 'following.html file');
    });
}

function handleManualFile(e, labelId, defaultText) {
    const label = document.getElementById(labelId);
    const file = e.target.files[0];
    
    if (file) {
        if (file.name.toLowerCase().endsWith('.html')) {
            label.textContent = `✅ ${file.name}`;
            label.classList.add('has-file');
        } else {
            showError('Please select an HTML file');
            e.target.value = '';
            label.textContent = `Choose ${defaultText}`;
            label.classList.remove('has-file');
        }
    } else {
        label.textContent = `Choose ${defaultText}`;
        label.classList.remove('has-file');
    }
    checkManualFilesAndEnableButton();
}

function initializeDragAndDrop() {
    const zipLabel = document.getElementById('zipLabel');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        zipLabel.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        zipLabel.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        zipLabel.addEventListener(eventName, unhighlight, false);
    });

    zipLabel.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    e.currentTarget.classList.add('drag-over');
}

function unhighlight(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith('.zip')) {
            document.getElementById('zipFile').files = files;
            document.getElementById('zipFile').dispatchEvent(new Event('change'));
        } else {
            showError('Please drop a ZIP file');
        }
    }
}

function toggleManualUpload() {
    const manualUpload = document.getElementById('manualUpload');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    if (currentMode === 'zip') {
        manualUpload.style.display = 'block';
        toggleBtn.textContent = 'Switch to ZIP upload';
        currentMode = 'manual';
        resetZipInput();
        checkManualFilesAndEnableButton();
    } else {
        manualUpload.style.display = 'none';
        toggleBtn.textContent = 'Switch to manual upload';
        currentMode = 'zip';
        resetManualInputs();
        checkZipAndEnableButton();
    }
}

function resetZipInput() {
    const label = document.getElementById('zipLabel');
    label.classList.remove('has-file');
    label.innerHTML = `
        <div class="upload-icon">📦</div>
        <div class="upload-text">
            <span class="main-text">Choose Instagram ZIP file</span>
            <span class="sub-text">Or drag and drop here</span>
        </div>
    `;
    document.getElementById('zipFile').value = '';
    disableAnalyzeButton();
}

function resetManualInputs() {
    document.getElementById('followersFile').value = '';
    document.getElementById('followingFile').value = '';
    document.getElementById('followersLabel').textContent = 'Choose followers.html file';
    document.getElementById('followingLabel').textContent = 'Choose following.html file';
    document.getElementById('followersLabel').classList.remove('has-file');
    document.getElementById('followingLabel').classList.remove('has-file');
    disableAnalyzeButton();
}

function checkZipAndEnableButton() {
    const zipFile = document.getElementById('zipFile').files[0];
    if (zipFile && zipFile.name.toLowerCase().endsWith('.zip')) {
        enableAnalyzeButton();
    } else {
        disableAnalyzeButton();
    }
}

function checkManualFilesAndEnableButton() {
    const followersFile = document.getElementById('followersFile').files[0];
    const followingFile = document.getElementById('followingFile').files[0];
    
    if (followersFile && followingFile) {
        enableAnalyzeButton();
    } else {
        disableAnalyzeButton();
    }
}

function enableAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = false;
    analyzeBtn.style.opacity = '1';
}

function disableAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    analyzeBtn.style.opacity = '0.6';
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
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
        max-width: 300px;
    `;
    errorDiv.innerHTML = `⚠️ ${message}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.animation = 'slideOutRight 0.5s ease-in-out forwards';
            setTimeout(() => {
                errorDiv.parentNode.removeChild(errorDiv);
            }, 500);
        }
    }, 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #28a745, #20c997);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1001;
        animation: slideInRight 0.5s ease-out;
        box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
        max-width: 300px;
    `;
    successDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.style.animation = 'slideOutRight 0.5s ease-in-out forwards';
            setTimeout(() => {
                successDiv.parentNode.removeChild(successDiv);
            }, 500);
        }
    }, 3000);
}

async function analyze() {
    try {
        showProcessingStatus();
        
        followers = [];
        following = [];
        notFollowingBack = [];
        
        if (currentMode === 'zip') {
            await analyzeZipFile();
        } else {
            await analyzeManualFiles();
        }
        
        // Calculate non-followers
        notFollowingBack = following.filter(user => !followers.includes(user));
        
        hideProcessingStatus();
        renderResults();
        
    } catch (error) {
        hideProcessingStatus();
        showError('Error analyzing data: ' + error.message);
        console.error('Analysis error:', error);
    }
}

async function analyzeZipFile() {
    const zipFile = document.getElementById('zipFile').files[0];
    if (!zipFile) throw new Error('No ZIP file selected');
    
    updateProcessingStep(1, 'active');
    
    try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);
        
        updateProcessingStep(1, 'completed');
        updateProcessingStep(2, 'active');
        
        // Look for followers and following files
        let followersContent = null;
        let followingContent = null;
        
        console.log('Searching for files in ZIP...');
        
        // Search through all files in the ZIP
        for (const [filename, file] of Object.entries(zipContent.files)) {
            if (!file.dir) {
                const lowerFilename = filename.toLowerCase();
                console.log('Found file:', filename);
                
                // Look for followers file - specifically followers_1.html in connections/followers_and_following/
                if ((lowerFilename.includes('connections/followers_and_following/followers_1.html') ||
                     lowerFilename.includes('followers_1.html') ||
                     (lowerFilename.includes('follower') && lowerFilename.endsWith('.html'))) && 
                    !followersContent) {
                    console.log('Found followers file:', filename);
                    followersContent = await file.async('string');
                }
                
                // Look for following file - specifically following.html in connections/followers_and_following/
                if ((lowerFilename.includes('connections/followers_and_following/following.html') ||
                     lowerFilename.includes('following.html') ||
                     (lowerFilename.includes('following') && lowerFilename.endsWith('.html') && !lowerFilename.includes('follower'))) && 
                    !followingContent) {
                    console.log('Found following file:', filename);
                    followingContent = await file.async('string');
                }
                
                // Break if we found both files
                if (followersContent && followingContent) {
                    break;
                }
            }
        }
        
        if (!followersContent || !followingContent) {
            console.log('Available files in ZIP:');
            for (const [filename, file] of Object.entries(zipContent.files)) {
                if (!file.dir) {
                    console.log('-', filename);
                }
            }
            
            const missingFiles = [];
            if (!followersContent) missingFiles.push('followers_1.html (usually in connections/followers_and_following/)');
            if (!followingContent) missingFiles.push('following.html (usually in connections/followers_and_following/)');
            
            throw new Error(`Could not find required files in ZIP: ${missingFiles.join(' and ')}. Please make sure you uploaded the complete Instagram data export with the connections folder.`);
        }
        
        updateProcessingStep(2, 'completed');
        updateProcessingStep(3, 'active');
        
        // Extract usernames
        followers = extractUsernamesFromHTML(followersContent);
        following = extractUsernamesFromHTML(followingContent);
        
        console.log(`Extracted ${followers.length} followers and ${following.length} following`);
        
        updateProcessingStep(3, 'completed');
        
        showSuccess('Data extracted successfully!');
        
    } catch (error) {
        throw new Error('Failed to process ZIP file: ' + error.message);
    }
}

async function analyzeManualFiles() {
    updateProcessingStep(1, 'completed');
    updateProcessingStep(2, 'active');
    
    const followersFile = document.getElementById('followersFile').files[0];
    const followingFile = document.getElementById('followingFile').files[0];
    
    if (!followersFile || !followingFile) {
        throw new Error('Both files are required');
    }
    
    try {
        const followersContent = await readFile(followersFile);
        const followingContent = await readFile(followingFile);
        
        updateProcessingStep(2, 'completed');
        updateProcessingStep(3, 'active');
        
        followers = extractUsernamesFromHTML(followersContent);
        following = extractUsernamesFromHTML(followingContent);
        
        updateProcessingStep(3, 'completed');
        
        showSuccess('Files processed successfully!');
        
    } catch (error) {
        throw new Error('Failed to read files: ' + error.message);
    }
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function extractUsernamesFromHTML(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Try different selectors for different Instagram export formats
        let anchors = doc.querySelectorAll('a[href*="instagram.com"]');
        
        if (anchors.length === 0) {
            anchors = doc.querySelectorAll('a');
        }
        
        const usernames = Array.from(anchors)
            .map(a => {
                // Extract from href if available
                if (a.href && a.href.includes('instagram.com/')) {
                    const match = a.href.match(/instagram\.com\/([^\/\?]+)/);
                    if (match) return match[1];
                }
                // Otherwise use text content
                return a.textContent.trim().replace('@', '');
            })
            .filter(username => username && username.length > 0)
            .filter(username => !username.includes('instagram.com'))
            .filter(username => !/^https?:/.test(username))
            .map(username => username.toLowerCase());
        
        // Remove duplicates
        return [...new Set(usernames)];
    } catch (error) {
        throw new Error('Failed to parse HTML file: ' + error.message);
    }
}

function showProcessingStatus() {
    document.getElementById('processingStatus').style.display = 'block';
    // Reset all steps
    for (let i = 1; i <= 3; i++) {
        updateProcessingStep(i, 'pending');
    }
}

function hideProcessingStatus() {
    document.getElementById('processingStatus').style.display = 'none';
}

function updateProcessingStep(stepNumber, status) {
    const step = document.getElementById(`step${stepNumber}`);
    
    // Remove all status classes
    step.classList.remove('active', 'completed', 'pending');
    step.classList.add(status);
    
    // Update step text based on status
    const stepTexts = {
        1: {
            pending: '📦 Extracting ZIP file...',
            active: '📦 Extracting ZIP file...',
            completed: '✅ ZIP file extracted'
        },
        2: {
            pending: '📊 Finding followers and following files...',
            active: '📊 Finding followers and following files...',
            completed: '✅ Files found'
        },
        3: {
            pending: '🔍 Analyzing data...',
            active: '🔍 Analyzing data...',
            completed: '✅ Analysis complete'
        }
    };
    
    if (stepTexts[stepNumber] && stepTexts[stepNumber][status]) {
        step.textContent = stepTexts[stepNumber][status];
    }
}

function renderResults() {
    const results = document.getElementById('results');
    
    if (notFollowingBack.length === 0) {
        results.innerHTML = `
            <div class="results-section">
                <div class="success-message">
                    🎉 Congratulations! Everyone you follow follows you back!
                    <br><br>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" style="color: #28a745;">${followers.length}</div>
                            <div class="stat-label">Total Followers</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: #17a2b8;">${following.length}</div>
                            <div class="stat-label">Total Following</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    results.innerHTML = `
        <div class="results-section">
            <div class="results-header">
                <h2 class="results-title">Analysis Results</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number" style="color: #28a745;">${followers.length}</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #17a2b8;">${following.length}</div>
                        <div class="stat-label">Following</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number count-display">${notFollowingBack.length}</div>
                        <div class="stat-label">Don't Follow Back</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #ffc107;">${((followers.length / following.length) * 100).toFixed(1)}%</div>
                        <div class="stat-label">Follow Back Rate</div>
                    </div>
                </div>
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
                <div class="username">${username}</div>
                <div class="unfollow-text">Tap to view profile</div>
            `;
            
            // Open profile and remove card when clicked
            userCard.onclick = () => {
                window.open(`https://instagram.com/${username}`, '_blank');
                
                // Animate card removal
                userCard.style.animation = 'cardSlideOut 0.3s ease-in-out forwards';
                
                setTimeout(() => {
                    if (userCard.parentNode) {
                        userCard.parentNode.removeChild(userCard);
                    }
                    
                    // Update the data
                    notFollowingBack = notFollowingBack.filter(u => u !== username);
                    
                    // Update the count display
                    const countDisplay = document.querySelector('.count-display');
                    if (countDisplay) {
                        countDisplay.textContent = notFollowingBack.length;
                    }
                    
                    // If no users left, show success message
                    if (notFollowingBack.length === 0) {
                        const results = document.getElementById('results');
                        results.innerHTML = `
                            <div class="results-section">
                                <div class="success-message">
                                    🎉 All profiles checked! Great job cleaning up your following list!
                                    <br><br>
                                    <button class="analyze-btn" onclick="location.reload()">
                                        🔄 Analyze Again
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                }, 300);
            };
            
            usersGrid.appendChild(userCard);
        }, index * 50); // Stagger the animations
    });
}
function viewProfile(username) {
    window.open(`https://instagram.com/${username}`, '_blank');
}

function removeFromList(username) {
    const userCards = document.querySelectorAll('.user-card');
    let targetCard = null;
    
    userCards.forEach(card => {
        const usernameElement = card.querySelector('.username');
        if (usernameElement && usernameElement.textContent === username) {
            targetCard = card;
        }
    });
    
    if (targetCard) {
        targetCard.style.animation = 'cardSlideOut 0.3s ease-in-out forwards';
        
        setTimeout(() => {
            if (targetCard.parentNode) {
                targetCard.parentNode.removeChild(targetCard);
            }
            
            // Update the data
            notFollowingBack = notFollowingBack.filter(u => u !== username);
            
            // Update the count display
            const countDisplay = document.querySelector('.count-display');
            if (countDisplay) {
                countDisplay.textContent = notFollowingBack.length;
            }
            
            // If no users left, show success message
            if (notFollowingBack.length === 0) {
                const results = document.getElementById('results');
                results.innerHTML = `
                    <div class="results-section">
                        <div class="success-message">
                            🎉 All profiles checked! Great job cleaning up your following list!
                            <br><br>
                            <button class="analyze-btn" onclick="location.reload()">
                                🔄 Analyze Again
                            </button>
                        </div>
                    </div>
                `;
            }
        }, 300);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        to { opacity: 0; transform: translateX(100px); }
    }
    
    @keyframes cardSlideOut {
        to { opacity: 0; transform: translateX(100px) scale(0.8); }
    }
    
    .drag-over {
        background: linear-gradient(45deg, rgba(225, 48, 108, 0.4), rgba(129, 52, 175, 0.4)) !important;
        border-color: rgba(225, 48, 108, 1) !important;
        transform: scale(1.02);
    }
    
    .step.pending { color: #666; }
    .step.active { color: #E1306C; animation: pulse 2s infinite; }
    .step.completed { color: #28a745; }
`;
document.head.appendChild(style);
