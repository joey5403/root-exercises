// AudioManager - 音效管理单例类
// 支持 HTML5 Audio 播放和 Web Audio API 程序化音效生成（作为 fallback）

class AudioManagerClass {
  constructor() {
    this.sounds = {};
    this.volume = 1.0;
    this.isMuted = false;
    this.previousVolume = 1.0;
    this.isInitialized = false;
    this.useWebAudioFallback = false;
    this.audioContext = null;
  }

  // 初始化音频管理器
  init() {
    if (this.isInitialized) return;

    this.isInitialized = true;
    
    // 预加载音效文件（使用相对路径）
    this.loadSound('correct', 'assets/sounds/correct.mp3');
    this.loadSound('incorrect', 'assets/sounds/incorrect.mp3');

    // 初始化 Web Audio API 作为 fallback
    this.initWebAudioFallback();
  }

  // 初始化 Web Audio API fallback
  initWebAudioFallback() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
        this.useWebAudioFallback = true;
        console.log('[AudioManager] Web Audio API fallback enabled');
      }
    } catch (e) {
      console.warn('[AudioManager] Web Audio API not supported', e);
    }
  }

  // 激活音频上下文（移动端需要在用户交互后调用）
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(e => {
        console.warn('[AudioManager] Failed to resume audio context', e);
      });
    }
  }

  // 加载音效文件
  loadSound(name, path) {
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`[AudioManager] Loaded: ${name}`);
      });

      audio.addEventListener('error', (e) => {
        console.warn(`[AudioManager] Failed to load ${name}:`, e);
        this.useWebAudioFallback = true;
      });

      this.sounds[name] = audio;
    } catch (e) {
      console.warn(`[AudioManager] Error loading ${name}:`, e);
      this.useWebAudioFallback = true;
    }
  }

  // 播放音效
  play(name) {
    if (!this.isInitialized) {
      this.init();
    }

    if (this.isMuted) return;

    const sound = this.sounds[name];
    
    // 如果文件未加载或加载失败，使用 Web Audio API 生成音效
    if (!sound || this.useWebAudioFallback) {
      this.playWebAudioSound(name);
      return;
    }

    // 使用 cloneNode 支持重叠播放
    const clone = sound.cloneNode();
    clone.volume = this.volume;
    
    clone.play().catch(e => {
      console.warn(`[AudioManager] Play failed for ${name}:`, e);
    });
  }

  // 使用 Web Audio API 生成程序化音效
  playWebAudioSound(name) {
    if (!this.audioContext) return;

    // 激活音频上下文
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    if (name === 'correct') {
      // 成功音效：高频 ascending tone
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); // C6
      gainNode.gain.setValueAtTime(this.volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } else if (name === 'incorrect') {
      // 错误音效：低频 descending tone
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gainNode.gain.setValueAtTime(this.volume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    }
  }

  // 设置音量
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    this.isMuted = this.volume === 0;
    
    // 保存到 localStorage
    try {
      localStorage.setItem('wubi98_audio_volume', String(this.volume));
    } catch (e) {
      console.warn('[AudioManager] Failed to save volume', e);
    }

    // 更新所有正在播放的声音
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  // 静音
  mute() {
    this.previousVolume = this.volume;
    this.isMuted = true;
    
    // 停止所有正在播放的声音
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });

    // 保存到 localStorage
    try {
      localStorage.setItem('wubi98_audio_muted', 'true');
      localStorage.setItem('wubi98_audio_previous_volume', String(this.previousVolume));
    } catch (e) {
      console.warn('[AudioManager] Failed to save mute state', e);
    }
  }

  // 取消静音
  unmute() {
    this.isMuted = false;
    this.volume = this.previousVolume;
    
    // 保存到 localStorage
    try {
      localStorage.setItem('wubi98_audio_muted', 'false');
      localStorage.setItem('wubi98_audio_volume', String(this.volume));
    } catch (e) {
      console.warn('[AudioManager] Failed to save unmute state', e);
    }
  }

  // 切换静音状态
  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  // 从 localStorage 加载音量设置
  loadVolumeSettings() {
    try {
      const savedVolume = localStorage.getItem('wubi98_audio_volume');
      const savedMuted = localStorage.getItem('wubi98_audio_muted');
      
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume) || 1.0;
        this.previousVolume = this.volume;
      }
      
      if (savedMuted === 'true') {
        this.isMuted = true;
        const savedPrevious = localStorage.getItem('wubi98_audio_previous_volume');
        if (savedPrevious) {
          this.previousVolume = parseFloat(savedPrevious) || 1.0;
        }
      }
    } catch (e) {
      console.warn('[AudioManager] Failed to load volume settings', e);
    }
  }

  // 获取当前音量
  getVolume() {
    return this.volume;
  }

  // 检查是否静音
  getIsMuted() {
    return this.isMuted;
  }
}

// 导出单例
const AudioManager = new AudioManagerClass();

// 页面加载时加载音量设置
AudioManager.loadVolumeSettings();
