"use client";

import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, updateDoc, increment, onSnapshot, collection, addDoc, query, orderBy, limit, where 
} from 'firebase/firestore';
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  Home, MessageSquare, BarChart2, Play, ChevronRight, Send, Heart, TrendingUp, MessageCircle, ChevronDown, CheckCircle, User, Target, Award, PlusCircle, Quote, X, ExternalLink, Activity, Info, BookOpen, MapPin, Zap, Bell, Volume2, Newspaper, Users, Medal, ShieldCheck, Share2, ArrowRight
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyANKRyxoEH4MGfko769FLjjNZZzUpg1yx4",
  authDomain: "proje-f8ab3.firebaseapp.com",
  projectId: "proje-f8ab3",
  storageBucket: "proje-f8ab3.firebasestorage.app",
  messagingSenderId: "655666500599",
  appId: "1:655666500599:web:43ff5f8003299d26efd4f2"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const badWords = [
  "küfür", "hakaret", "salak", "aptal", "gerizekalı", "şerefsiz", "piç", "o.ç", "amk", "sik", "yarak", "göt",
  "orospu", "it", "köpek", "mal", "dangalak", "pezevenk", "amına", "sikeyim", "sokuk", "yavşak", "ibne", "puşt", "or.ç", "aq",
  "kaltak", "fahişe", "kahpe", "bok", "yavsak", "gavat"
];

const isClean = (text: string) => {
  if (!text) return true;
  const lowerText = text.toLowerCase();
  const noSpaceText = lowerText.replace(/\s+/g, '');
  return !badWords.some(word => lowerText.includes(word) || noSpaceText.includes(word));
};

const marqueeMessages = [
  "ENVER'LE ZAFERE! Osmaniye İçin Sözümüz Var.",
  "Kadirli Yer Fıstığı Markalaşma Projemiz Hazır!",
  "Düziçi Teknoloji Kampüsü Sözümüz Var.",
  "Sığınmacı Sorununu Çözeceğiz, Huzuru Getireceğiz.",
  "Osmaniye'nin Gür Sesi Olmaya Hazırım.",
];

const tabOrder = ['home', 'medya', 'saha', 'gonullu', 'iletisim'];

const playPopSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch(e) {}
};


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [tabHistory, setTabHistory] = useState<string[]>(['home']);

  useEffect(() => {
    isSupported().then((supported) => {
      if (supported) {
        const analytics = getAnalytics(app);
        logEvent(analytics, 'app_open');
      }
    });
  }, []);

  useEffect(() => {
    if (tabHistory[tabHistory.length - 1] !== activeTab) {
      setTabHistory(prev => [...prev, activeTab]);
    }
  }, [activeTab]);

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [expandedPromise, setExpandedPromise] = useState<number | null>(null);
  const [expandedKarne, setExpandedKarne] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [pollResults, setPollResults] = useState<any>({ opt1: 0, opt2: 0, opt3: 0, opt4: 0, opt5: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [hasSupported, setHasSupported] = useState(false);
  const [citizenIdea, setCitizenIdea] = useState("");
  const [sentCategories, setSentCategories] = useState<string[]>([]);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [showBioModal, setShowBioModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTouchStartX, setImageTouchStartX] = useState<number | null>(null);
  const [frontCardIndex, setFrontCardIndex] = useState(0);

  const [infographicCategory, setInfographicCategory] = useState<string>('TÜMÜ');
  
  const allInfoImages = [
    { src: '/info1.jpg', category: 'EĞİTİM' },
    { src: '/info2.jpg', category: 'EKONOMİ' },
    { src: '/info3.png', category: 'TARIM' },
    { src: '/info1.jpg', category: 'GÜVENLİK' },
    { src: '/info2.jpg', category: 'TURİZM' },
    { src: '/info3.png', category: 'SANAYİ' },
    { src: '/info1.jpg', category: 'KÜLTÜR-SANAT' },
    { src: '/info2.jpg', category: 'SPOR' }
  ];
  
  const infoImages = infographicCategory === 'TÜMÜ' 
    ? allInfoImages.map(i => i.src)
    : allInfoImages.filter(i => i.category === infographicCategory).map(i => i.src);

  const infoCategories = ['TÜMÜ', 'EĞİTİM', 'EKONOMİ', 'TARIM', 'GÜVENLİK', 'TURİZM', 'SANAYİ', 'KÜLTÜR-SANAT', 'SPOR'];
  const navigateImage = (direction: number) => {
    if (!selectedImage) return;
    
    let currentGallery = infoImages;
    if (selectedImage.includes('merkez')) {
      currentGallery = ['/merkez1.png', '/merkez2.png', '/merkez3.png', '/merkez4.png'];
    }

    const currentIndex = currentGallery.indexOf(selectedImage);
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex + direction;
    if (newIndex >= currentGallery.length) newIndex = 0;
    if (newIndex < 0) newIndex = currentGallery.length - 1;
    
    setSelectedImage(currentGallery[newIndex]);
    if (!selectedImage.includes('merkez')) setFrontCardIndex(newIndex);
    try { new Audio('/pop.mp3').play().catch(()=>console.log('Audio play ignored')); } catch(e){}
  };

  const handleImageTouchEnd = (e: React.TouchEvent) => {
    if (imageTouchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = imageTouchStartX - touchEndX;
    if (diff > 50) {
        navigateImage(1);
        try { playPopSound(); } catch(e){}
    }
    else if (diff < -50) {
        navigateImage(-1);
        try { playPopSound(); } catch(e){}
    }
    setImageTouchStartX(null);
  };

  const [showGoalsModal, setShowGoalsModal] = useState(false);
  // Dijital Meclis State'leri
  const [meclisVote, setMeclisVote] = useState<string | null>(null);
  const [meclisResults, setMeclisResults] = useState({ evet: 1453, hayir: 247 }); // Temsili başlangıç verisi
  const [quickQuestion, setQuickQuestion] = useState("");

  const [reportImage, setReportImage] = useState<File | null>(null);
  const [reportImagePreview, setReportImagePreview] = useState<string | null>(null); // Yeni: Fotoğraf önizleme state'i
  const [reportDesc, setReportDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Bildirim State'i
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Cihazınız sesli okuma özelliğini desteklemiyor.");
    }
  };

  // Gelişmiş Swipe (Kaydırma) Kontrolleri
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const districts = [
    { id: 'kadirli', name: 'KADİRLİ', icon: '🥜', solution: 'Kadirli Fıstık İhtisas OSB ve Savrun Çayı Islahı ile fıstığın katma değeri şehirde kalacak.', project: 'Altın Fıstık Kooperatifi' },
    { id: 'duzici', name: 'DÜZİÇİ', icon: '⛲', solution: 'Haruniye Kaplıcaları Modernizasyonu ve Düziçi Teknoloji Kampüsü ile gençlere iş alanı.', project: 'Haruniye Teknoloji Vadisi' },
    { id: 'bahce', name: 'BAHÇE', icon: '🪵', solution: 'Modern Soğuk Hava Depoları ve Bahçe Lojistik Üssü ile ceviz ve kiraz üreticisi kazanacak.', project: 'Bahçe Lojistik Köyü' },
    { id: 'toprakkale', name: 'TOPRAKKALE', icon: '⚙️', solution: 'OSB Filtreleme Denetimi ve Toprakkale Yerli İstihdam Ofisi ile temiz hava, yerli iş gücü.', project: 'Yeşil OSB Hareketi' },
    { id: 'sumbas', name: 'SUMBAS', icon: '🚜', solution: 'Sumbas Kapalı Devre Sulama Sistemi ve Damızlık Hayvancılık Desteği ile köyden göç duracak.', project: 'Sumbas Üretim Hamlesi' },
  ];

  useEffect(() => {
    document.documentElement.lang = "tr";
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    (window as any).addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const splashTimer = setTimeout(() => { setIsLoading(false); }, 3000);
    setHasVoted(localStorage.getItem('app_voted_v2') === 'true');
    setHasSupported(localStorage.getItem('app_supported_v2') === 'true');
    const savedCats = localStorage.getItem('app_sent_categories');
    if (savedCats) setSentCategories(JSON.parse(savedCats));
    
    // Meclis oyu kontrolü
    const savedMeclisVote = localStorage.getItem('app_meclis_vote');
    if (savedMeclisVote) setMeclisVote(savedMeclisVote);

    // Bildirim kontrolü
    setNotificationsEnabled(localStorage.getItem('app_notifications') === 'true');

    signInAnonymously(auth).catch(console.error);
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => { 
      clearTimeout(splashTimer);
      unsubAuth();
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // YENİ: Temizlenen ve hassasiyeti artırılan Touch olayları (Dikey kaydırma kazalarını önler)
  const handleTouchStart = (e: React.TouchEvent) => { 
    touchStartX.current = e.targetTouches[0].clientX; 
    touchStartY.current = e.targetTouches[0].clientY; 
  };
  const handleTouchMove = (e: React.TouchEvent) => { 
    touchEndX.current = e.targetTouches[0].clientX; 
    touchEndY.current = e.targetTouches[0].clientY; 
  };
  const handleTouchEnd = () => {
    if (selectedImage) return; 
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return;
    
    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;

    // YENİ: Sadece yatay hareket (X ekseni) 120px'den büyükse ve dikey kayma 50px'den küçükse sekme değiştir
    if (Math.abs(distanceX) > 120 && Math.abs(distanceY) < 50) {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (distanceX > 120 && currentIndex < tabOrder.length - 1) { setActiveTab(tabOrder[currentIndex + 1]); setSelectedCategory(null); }
      if (distanceX < -120 && currentIndex > 0) { setActiveTab(tabOrder[currentIndex - 1]); setSelectedCategory(null); }
      window.scrollTo(0, 0);
    }
    
    touchStartX.current = null; touchEndX.current = null;
    touchStartY.current = null; touchEndY.current = null;
  };

  // --- YENİ: Geri Tuşu (PopState) Yöneticisi ---
  const prevStateRef = useRef({ activeTab: 'home', selectedImage: null as any, showBioModal: false, showGoalsModal: false, selectedCategory: null as any, selectedDistrict: null as any });
  useEffect(() => {
    const current = { activeTab, selectedImage, showBioModal, showGoalsModal, selectedCategory, selectedDistrict };
    const prev = prevStateRef.current;
    const openedTab = prev.activeTab === 'home' && current.activeTab !== 'home';
    const openedImage = !prev.selectedImage && !!current.selectedImage;
    const openedBio = !prev.showBioModal && current.showBioModal;
    const openedGoals = !prev.showGoalsModal && current.showGoalsModal;
    const openedCategory = !prev.selectedCategory && !!current.selectedCategory;
    const openedDistrict = !prev.selectedDistrict && !!current.selectedDistrict;
    
    if (openedTab || openedImage || openedBio || openedGoals || openedCategory || openedDistrict) {
      window.history.pushState({ modal: true }, '');
    }
    prevStateRef.current = current;
  }, [activeTab, selectedImage, showBioModal, showGoalsModal, selectedCategory, selectedDistrict]);

  useEffect(() => {
    const handlePopState = () => {
      if (selectedImage) { setSelectedImage(null); return; }
      if (showBioModal) { setShowBioModal(false); return; }
      if (showGoalsModal) { setShowGoalsModal(false); return; }
      if (selectedCategory) { setSelectedCategory(null); return; }
      if (selectedDistrict) { setSelectedDistrict(null); return; }
      if (activeTab !== 'home') { 
        if (tabHistory.length > 1) {
          const newHistory = [...tabHistory];
          newHistory.pop();
          setActiveTab(newHistory[newHistory.length - 1]);
          setTabHistory(newHistory);
        } else {
          setActiveTab('home'); 
        }
        return; 
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedImage, showBioModal, showGoalsModal, selectedCategory, selectedDistrict, activeTab]);

  useEffect(() => {
    if (!user) return;
    const unsubDestekler = onSnapshot(doc(db, 'destekler', 'mobil-sayac-v2'), (s) => s.exists() && setSupportCount(s.data().count || 0));
    const unsubAnketler = onSnapshot(doc(db, 'anketler', 'mobil-osmaniye-v2'), (s) => s.exists() && setPollResults(s.data()));
    const q = query(collection(db, 'fikirler'), where('onay', '==', true), orderBy('tarih', 'desc'), limit(6));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setLiveMessages(msgs);
    });
    return () => {
      unsubDestekler();
      unsubAnketler();
      unsubMessages();
    };
  }, [user]);

  const handleSupportClick = async () => {
    if (hasSupported) return;
    setHasSupported(true);
    try {
      await updateDoc(doc(db, 'destekler', 'mobil-sayac-v2'), { count: increment(1) });
      localStorage.setItem('app_supported_v2', 'true');
    } catch (err) {
      setHasSupported(false);
      alert("Hata oluştu.");
    }
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted) return;
    setHasVoted(true);
    try {
      await updateDoc(doc(db, 'anketler', 'mobil-osmaniye-v2'), { [optionId]: increment(1) });
      localStorage.setItem('app_voted_v2', 'true');
    } catch (err) {
      setHasVoted(false);
    }
  };

  // YENİ: Dijital Meclis Oy İşlemi ve Grafik Güncellemesi
  const handleMeclisVoteSubmit = async (vote: 'evet' | 'hayir') => {
    try {
      alert("Sistem oyu aldı: " + vote);
      try { playPopSound(); } catch(e) {}
      if (meclisVote) return;
      setMeclisVote(vote);
      setMeclisResults(prev => ({ ...prev, [vote]: prev[vote] + 1 }));
      try { localStorage.setItem('app_meclis_vote', vote); } catch(e) {}
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const catId = selectedCategory?.id || 'iletisim';
    if (sentCategories.includes(catId)) { alert("Bu başlıkta zaten bir sözünüz var!"); return; }
    if (!citizenIdea.trim()) return;

    if (!isClean(citizenIdea)) {
      alert("Lütfen topluluk kurallarına uygun bir dil kullanın.");
      return;
    }

    try {
      await addDoc(collection(db, 'fikirler'), { kategori: catId, mesaj: citizenIdea, tarih: new Date().toISOString(), user: user?.uid || 'anonim', onay: false });
      const newSentCats = [...sentCategories, catId];
      setSentCategories(newSentCats);
      localStorage.setItem('app_sent_categories', JSON.stringify(newSentCats));
      setCitizenIdea(""); alert("İletildi.");
    } catch (err) { alert("Hata."); }
  };

  const handleSahaSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!reportDesc.trim() && !reportImage) { alert("Lütfen bir açıklama yazın veya fotoğraf/video ekleyin."); return; }
    if (reportDesc && !isClean(reportDesc)) { alert("Rapor açıklamanız uygun olmayan kelimeler içeriyor."); return; }
    
    setIsUploading(true);
    setUploadProgress(5);
    try {
      let mediaUrl = null;
      let mediaType = null;
      
      if (reportImage) {
        const storageRef = ref(storage, `saha_raporlari_medya/${Date.now()}_${reportImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, reportImage);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            }, 
            async () => {
              mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
              mediaType = reportImage.type.startsWith('video') ? 'video' : 'image';
              resolve();
            }
          );
        });
      }

      await addDoc(collection(db, 'saha_raporlari'), { 
        user: user?.uid || 'anonim', 
        aciklama: reportDesc, 
        medya: mediaUrl,
        medyaTipi: mediaType,
        tarih: new Date().toISOString(), 
        durum: 'inceleniyor' 
      });
      
      setReportDesc(""); 
      setReportImage(null); 
      setReportImagePreview(null);
      setUploadProgress(0);
      alert("Raporunuz başarıyla iletildi. Teşekkür ederiz."); 
      setActiveTab('home');
    } catch (err) { 
      console.error(err);
      alert("İletim sırasında bir hata oluştu."); 
    } finally { 
      setIsUploading(false); 
      setUploadProgress(0);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.type.startsWith('video')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 16) { // 1 sn tolerans payı
            alert("Lütfen 15 saniyeden kısa bir video seçin.");
            return;
          }
          setReportImage(file);
          setReportImagePreview(URL.createObjectURL(file));
        }
        video.src = URL.createObjectURL(file);
      } else {
        setReportImage(file);
        setReportImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('app_notifications', 'false');
    } else {
      alert("Osmaniye ile ilgili son dakika duyuruları için bildirimler aktifleştirildi!");
      setNotificationsEnabled(true);
      localStorage.setItem('app_notifications', 'true');
    }
  };

  const handleWatermarkClick = () => {
    setSelectedImage(null);
    setShowBioModal(true);
  };

  const calculatePercent = (val: number) => {
    const total = Object.values(pollResults).reduce((a: any, b: any) => a + b, 0);
    return total ? Math.round((val / (total as number)) * 100) : 0;
  };

  const preventActions = (e: React.SyntheticEvent) => { e.preventDefault(); return false; };

  const categories = [
    { id: 'tarim', title: 'TARIM VE YÖRESEL KALKINMA', icon: '🚜', color: 'bg-green-600', promises: [{ title: 'Markalaşma ve Patent', desc: 'Ürünlerimize uluslararası patent alacağız.' }] },
    { id: 'guvenlik', title: 'GÜVENLİ VE MODERN ŞEHİR', icon: '🛡️', color: 'bg-blue-600', promises: [{ title: 'Sokak Güvenliği', desc: 'Sokaklarımızı daha güvenli hale getireceğiz.' }] },
    { id: 'turizm', title: 'KÜLTÜR VE TURİZM', icon: '🏛️', color: 'bg-orange-500', promises: [{ title: 'Zorkun Kayak Merkezi', desc: 'Turizm potansiyelimizi artıracağız.' }] },
    { id: 'sanayi', title: 'SANAYİ VE TEKNOLOJİ', icon: '⚙️', color: 'bg-gray-700', promises: [{ title: 'OSB Genişleme Planı', desc: 'Yeni istihdam alanları açacağız.' }] },
    { id: 'egitim', title: 'ULUSAL EĞİTİM VİZYONU', icon: '🎓', color: 'bg-purple-600', promises: [{ title: 'Modern Laboratuvarlar', desc: 'Eğitimi teknolojiyle buluşturacağız.' }] },
    { id: 'spor', title: 'SPOR VE GENÇLİK', icon: '⚽', color: 'bg-red-600', promises: [{ title: 'Osmaniyespor Markası', desc: 'Şehrimizin takımına sahip çıkacağız.' }] },
  ];

  return (
    <>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: fit-content; animation: marquee 30s linear infinite; }
        .font-marka { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 900; }
        img, video { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; }
        img:not(.clickable-img) { pointer-events: none; }
        .clickable-img { pointer-events: auto !important; }
        @keyframes stampHit {
          0% { transform: scale(3) translateY(-30px); opacity: 0; }
          10% { transform: scale(3) translateY(-30px); opacity: 1; }
          15% { transform: scale(1) translateY(0); opacity: 1; }
          40% { transform: scale(1) translateY(0); opacity: 1; }
          45% { transform: scale(1.2) translateY(-10px); opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes swellAndCover {
          0% { transform: scale(0.9); opacity: 0; }
          10% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 1; }
          85% { transform: scale(1.15); opacity: 1; } /* 3 saniyenin son 0.5 saniyesine (yaklaşık %83-100 aralığına denk gelir) kadar bekler */
          100% { transform: scale(25); opacity: 0; } /* son anda ekranı kaplayarak kaybolur */
        }
        .animate-swell-cover {
          animation: swellAndCover 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      {isLoading ? (
        <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center text-black overflow-hidden animate-out fade-out duration-500 delay-[2500ms] fill-mode-forwards pointer-events-none">
            <div className="relative flex flex-col items-center justify-center w-full">
                {/* Dev arka plan gölge mührü */}
                <img src="/zafer-muhur.png" className="w-[150vw] h-[150vw] md:w-[100vh] md:h-[100vh] max-w-none object-contain animate-pulse opacity-5 absolute" alt="Mühür Arka Plan" />
                {/* Ana büyük mühür (Yeni animasyon eklendi) */}
                <img src="/zafer-muhur.png" className="w-[85vw] h-[85vw] md:w-[50vh] md:h-[50vh] object-contain animate-swell-cover relative z-10 drop-shadow-[0_20px_50px_rgba(220,38,38,0.2)]" alt="Mühür" />
            </div>
            <span className="font-black text-red-600 tracking-[0.4em] uppercase text-2xl italic mt-16 relative z-10 text-center animate-out fade-out duration-300 delay-[2500ms] fill-mode-forwards">ENVER'LE<br/>ZAFERE</span>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-red-50 min-h-screen pb-24 font-sans text-gray-900 select-none overflow-x-hidden text-black" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onContextMenu={preventActions}>
          
          {showInstallBanner && (
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between shadow-2xl relative z-[300] border-b-4 border-red-600 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <img src="/icon-192.png" className="w-12 h-12 rounded-2xl shadow-lg border-2 border-red-600" alt="App Icon" />
                <div className="flex flex-col">
                  <span className="font-black text-[13px] uppercase tracking-wider text-red-500">Enver Erdoğan App</span>
                  <span className="text-[10px] font-medium opacity-80 mt-0.5">Hızlı Erişim İçin Yükleyin</span>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <button 
                  onClick={async () => {
                    setShowInstallBanner(false);
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      setDeferredPrompt(null);
                    }
                  }} 
                  className="bg-red-600 text-white px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.5)] active:scale-95"
                >
                  YÜKLE
                </button>
                <button onClick={() => setShowInstallBanner(false)} className="text-gray-400 p-1 bg-white/10 rounded-full active:scale-95"><X size={16} /></button>
              </div>
            </div>
          )}

          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ease-in-out transform ${isScrolled ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90 pointer-events-none'}`}>
            <div className="bg-white/95 backdrop-blur-xl shadow-2xl px-8 py-3 rounded-full border border-red-100 flex items-center gap-4 w-max">
              <img src="/zafer-logo.png" className="h-6 w-auto flex-shrink-0" alt="Logo" />
              <div className="flex items-center font-marka text-[14px] tracking-tighter uppercase whitespace-nowrap text-black leading-none">
                  <span className="text-red-600">ENVER</span><span className="text-black">'LE ZAFERE</span>
              </div>
            </div>
          </div>

          <header className="bg-white px-4 h-16 flex items-center justify-between sticky top-0 z-[100] shadow-sm border-b border-gray-100 text-black">
            <div className="flex items-center gap-3">
              <img src="/zafer-logo.png" className="h-8 w-auto" alt="Logo" />
              <div onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); try{ playPopSound(); }catch(e){} }} className="flex items-center font-marka text-lg tracking-tighter uppercase whitespace-nowrap text-black cursor-pointer active:scale-95 transition-transform">
                  <span className="text-red-600">ENVER</span><span className="text-black">'LE ZAFERE</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleNotifications} className={`transition-all ${notificationsEnabled ? 'text-red-600' : 'text-gray-400'}`}>
                <Bell size={22} fill={notificationsEnabled ? "currentColor" : "none"} />
              </button>
              <div className="w-10 h-10 rounded-full border-2 border-red-600 overflow-hidden bg-gray-200 shadow-md pointer-events-none select-none">
                <img src="/enver-profil.png" className="w-full h-full object-cover scale-110" onContextMenu={preventActions} onDragStart={preventActions} alt="Portre" style={{ objectPosition: 'center 15%', WebkitTouchCallout: 'none' }} />
              </div>
            </div>
          </header>

          <main>
            {activeTab === 'home' && (
              <div className="animate-in fade-in duration-500 pb-10">
                <div className="p-4 pt-6">
                    {/* Header Image */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden h-[280px] border-2 border-red-100 pointer-events-none select-none">
                        <img src="/enver-kapak.png" className="h-full w-full object-cover" onContextMenu={preventActions} onDragStart={preventActions} alt="Kapak" style={{ objectPosition: 'center 20%', WebkitTouchCallout: 'none' }} />
                    </div>
                    <div onClick={() => setShowBioModal(true)} className="mt-2 text-center text-black">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest cursor-pointer hover:underline text-black">ENVER ERDOĞAN KİMDİR?</span>
                    </div>
                </div>

                <div className="p-4 mt-2 text-black text-center flex flex-col items-center">
                    
                    {/* MECLİS MODULE INTEGRATED INTO HOME */}
                    <div className="w-full max-w-lg bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border-b-[12px] border-red-600 mb-10 text-white mt-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={100} /></div>
                      <div className="flex items-center gap-3 mb-4 text-red-500 relative z-10">
                        <Award size={24} />
                        <span className="font-black text-[10px] uppercase tracking-widest text-white">Dijital Meclis | Haftanın Önergesi</span>
                      </div>
                      <h3 className="font-black text-lg leading-tight mb-4 uppercase relative z-10">Sığınmacıların Şehir Merkezindeki Ticari Faaliyetlerinin Sınırlandırılması</h3>
                      
                      {meclisVote ? (
                        <div className="mt-6 animate-in fade-in relative z-10">
                          <p className="text-xs text-gray-300 mb-4 leading-relaxed italic">
                            "Oyunuz kaydedildi. Osmaniye halkının kararı aşağıdadır."
                          </p>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-xs font-black uppercase mb-1">
                                <span className="text-green-400">Kabul</span>
                                <span>%{Math.round((meclisResults.evet / (meclisResults.evet + meclisResults.hayir)) * 100)}</span>
                              </div>
                              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(meclisResults.evet / (meclisResults.evet + meclisResults.hayir)) * 100}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-black uppercase mb-1">
                                <span className="text-red-400">Red</span>
                                <span>%{Math.round((meclisResults.hayir / (meclisResults.evet + meclisResults.hayir)) * 100)}</span>
                              </div>
                              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${(meclisResults.hayir / (meclisResults.evet + meclisResults.hayir)) * 100}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-10">
                          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                            Meclis'te bu konuda bir kanun teklifi verilse, Osmaniye'nin çıkarı için oyunuz ne olurdu?
                          </p>
                          <div className="grid grid-cols-2 gap-4 relative z-[100]">
                            <button type="button" onPointerDown={(e) => { e.stopPropagation(); handleMeclisVoteSubmit('evet'); }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMeclisVoteSubmit('evet'); }} className="py-4 rounded-2xl font-black uppercase text-xs transition-all bg-white/10 text-white border border-white/20 active:scale-95 cursor-pointer pointer-events-auto">Kabul</button>
                            <button type="button" onPointerDown={(e) => { e.stopPropagation(); handleMeclisVoteSubmit('hayir'); }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMeclisVoteSubmit('hayir'); }} className="py-4 rounded-2xl font-black uppercase text-xs transition-all bg-white/10 text-white border border-white/20 active:scale-95 cursor-pointer pointer-events-auto">Red</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SÜREKLİ TEKRARLAYAN PUSULA/MÜHÜR ANİMASYONU */}
                    <div className="w-full max-w-sm mb-12 flex flex-col items-center">
                        <h2 className="font-black text-xl uppercase italic text-center mb-6 border-b-4 border-red-600 inline-block w-full pb-2">KARARIMIZ NET</h2>
                        
                        {/* Gerçekçi Seçim Pusulası Simülasyonu */}
                        <div className="bg-[#fcfbf9] border-[3px] border-black p-2 shadow-2xl flex flex-col items-center w-36 h-[22rem] relative bg-[url('/paper-texture.png')]">
                            
                            {/* Parti Logosu (Altındaki sloganı maskelemek için sabit yükseklik) */}
                            <div className="w-28 h-20 overflow-hidden flex justify-center items-start mt-6">
                                <img src="/zafer-logo.png" alt="Zafer Partisi Logo" className="w-28 h-auto" />
                            </div>
                            
                            {/* Orta Boşluk */}
                            <div className="flex-1 w-full border-t-[2px] border-dashed border-gray-400 mt-2 opacity-40"></div>
                            
                            {/* Basılacak Daire */}
                            <div className="w-16 h-16 rounded-full border-[3px] border-black flex items-center justify-center relative mb-8 bg-white shadow-inner">
                                
                                {/* Dışarıdan İnen ve Vuran EVET Mührü */}
                                <div className="absolute w-[4.5rem] h-[4.5rem] rounded-full border-[5px] border-red-600 flex items-center justify-center animate-[stampHit_4s_infinite] bg-white shadow-xl z-30">
                                    <span className="font-black text-red-600 text-lg tracking-widest" style={{ transform: 'rotate(-10deg)' }}>EVET</span>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    {/* YENİ İNTERAKTİF HARİTA EKLENTİSİ */}
                    <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border-t-[10px] border-red-600 mb-8 text-left border-2 border-red-100">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin className="text-red-600" size={24} />
                            <h3 className="font-black text-xl uppercase italic">İnteraktif Osmaniye Haritası</h3>
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase mb-4 text-center">İlçelere Tıklayın:</p>
                        
                            <div className="relative w-full aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-red-50 flex items-center justify-center p-2">
                                {/* Gerçek Harita Entegrasyonu (Logolar gizlenmiş şekilde) */}
                                <iframe 
                                    src="https://maps.google.com/maps?q=Osmaniye,%20Turkey&t=&z=10&ie=UTF8&iwloc=&output=embed" 
                                    className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%]"
                                    style={{ filter: 'grayscale(1) sepia(1) hue-rotate(310deg) saturate(3) opacity(0.8)', pointerEvents: 'none' }}
                                    title="Osmaniye Haritası"
                                ></iframe>
                                
                                {/* Etkileşimli İlçe Pinleri (Harita Üzerine Tam Konumlandırılmış) */}
                                <div className="absolute inset-0 z-10 pointer-events-none">
                                  {/* Merkez */}
                                  <button style={{ top: '55%', left: '48%' }} className="absolute pointer-events-auto group transform -translate-x-1/2 -translate-y-1/2" onClick={() => { try { playPopSound(); } catch(e){} setSelectedDistrict({ id: 'merkez', name: 'MERKEZ', icon: '🏙️', solution: 'Şehir merkezi kentsel dönüşüm ile yenilenecek.' }) }}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-xl border-2 border-white ${selectedDistrict?.id === 'merkez' ? 'bg-red-600 scale-125 z-20' : 'bg-black group-hover:bg-red-500'}`}>
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    <span className="absolute top-7 left-1/2 transform -translate-x-1/2 text-[10px] font-black text-black bg-white/90 px-2 py-0.5 rounded shadow-sm border border-gray-200">MERKEZ</span>
                                  </button>
                                  
                                  {/* Kadirli */}
                                  <button style={{ top: '25%', left: '30%' }} className="absolute pointer-events-auto group transform -translate-x-1/2 -translate-y-1/2" onClick={() => { try { playPopSound(); } catch(e){} setSelectedDistrict(districts[0]) }}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-xl border-2 border-white ${selectedDistrict?.id === 'kadirli' ? 'bg-red-600 scale-125 z-20' : 'bg-black group-hover:bg-red-500'}`}></div>
                                    <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-[9px] font-black text-black bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-gray-200">KADİRLİ</span>
                                  </button>

                                  {/* Sumbas */}
                                  <button style={{ top: '15%', left: '20%' }} className="absolute pointer-events-auto group transform -translate-x-1/2 -translate-y-1/2" onClick={() => { try { playPopSound(); } catch(e){} setSelectedDistrict(districts[4]) }}>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all shadow-xl border-2 border-white ${selectedDistrict?.id === 'sumbas' ? 'bg-red-600 scale-125 z-20' : 'bg-black group-hover:bg-red-500'}`}></div>
                                    <span className="absolute top-5 left-1/2 transform -translate-x-1/2 text-[8px] font-black text-black bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-gray-200">SUMBAS</span>
                                  </button>

                                  {/* Düziçi */}
                                  <button style={{ top: '35%', left: '75%' }} className="absolute pointer-events-auto group transform -translate-x-1/2 -translate-y-1/2" onClick={() => { try { playPopSound(); } catch(e){} setSelectedDistrict(districts[1]) }}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-xl border-2 border-white ${selectedDistrict?.id === 'duzici' ? 'bg-red-600 scale-125 z-20' : 'bg-black group-hover:bg-red-500'}`}></div>
                                    <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-[9px] font-black text-black bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-gray-200">DÜZİÇİ</span>
                                  </button>

                                  {/* Bahçe */}
                                  <button style={{ top: '25%', left: '90%' }} className="absolute pointer-events-auto group transform -translate-x-1/2 -translate-y-1/2" onClick={() => { try { playPopSound(); } catch(e){} setSelectedDistrict(districts[2]) }}>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all shadow-xl border-2 border-white ${selectedDistrict?.id === 'bahce' ? 'bg-red-600 scale-125 z-20' : 'bg-black group-hover:bg-red-500'}`}></div>
                                    <span className="absolute top-5 left-1/2 transform -translate-x-1/2 text-[8px] font-black text-black bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-gray-200">BAHÇE</span>
                                  </button>

                                  {/* Toprakkale */}
                                  <button style={{ top: '65%', left: '35%' }} className="absolute pointer-events-auto group transform -translate-x-1/2 -translate-y-1/2" onClick={() => { try { playPopSound(); } catch(e){} setSelectedDistrict(districts[3]) }}>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all shadow-xl border-2 border-white ${selectedDistrict?.id === 'toprakkale' ? 'bg-red-600 scale-125 z-20' : 'bg-black group-hover:bg-red-500'}`}></div>
                                    <span className="absolute top-5 left-1/2 transform -translate-x-1/2 text-[8px] font-black text-black bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-gray-200">TOPRAKKALE</span>
                                  </button>
                                </div>
                            </div>

                        {selectedDistrict && (
                            <div className="mt-4 bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-red-100 shadow-xl animate-in slide-in-from-top-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-3xl">{selectedDistrict.icon}</span>
                                    <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase shadow-md animate-pulse">Özel İnfografik</span>
                                </div>
                                <h4 className="font-black text-lg uppercase text-red-600 mb-2">{selectedDistrict.name} İÇİN VİZYON</h4>
                                <p className="text-sm font-bold text-gray-800 mb-4">{selectedDistrict.solution}</p>

                                {selectedDistrict.id === 'merkez' && (
                                    <button 
                                      onClick={() => { try { playPopSound(); } catch(e){} setSelectedImage('/merkez1.png'); }} 
                                      className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mb-4 border border-red-500"
                                    >
                                      <Play size={16} fill="white" />
                                      VİZYONU İNCELE
                                    </button>
                                )}
                                
                                {/* YENİ: İlçeye Özel Saha Raporu Butonu */}
                                <button 
                                  onClick={() => {
                                    setActiveTab('saha');
                                    setReportDesc(`${selectedDistrict.name} İlçesi Sorunu: `);
                                  }} 
                                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                  <Zap size={16} className="text-yellow-400" />
                                  {selectedDistrict.name}'ndeki Sorunu Bildir
                                </button>
                            </div>
                        )}
                    </div>



                    <div className="w-full max-w-lg mb-12 text-black text-left mt-6 px-4">
                        <h2 className="font-black text-2xl uppercase italic text-center mb-8 border-b-4 border-red-600 inline-block w-full pb-2">VİZYON İNFOGRAFİKLERİ</h2>
                        
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x" onTouchStart={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
                           {infoCategories.map(cat => (
                             <button key={cat} onClick={() => { setInfographicCategory(cat); setFrontCardIndex(0); try{ playPopSound(); }catch(e){} }} className={`snap-start whitespace-nowrap px-6 py-3 rounded-full font-black text-[10px] tracking-widest uppercase transition-all shadow-md active:scale-95 border-2 ${infographicCategory === cat ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-100 hover:border-red-200'}`}>
                               {cat}
                             </button>
                           ))}
                        </div>

                        {infoImages.length > 0 ? (
                          <div 
                              className="relative h-72 w-full flex justify-center items-center mt-4"
                              onTouchStart={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.setAttribute('data-touchstart', e.touches[0].clientX.toString());
                                  e.currentTarget.setAttribute('data-swiping', 'false');
                              }}
                              onTouchMove={(e) => {
                                  e.stopPropagation();
                                  e.currentTarget.setAttribute('data-swiping', 'true');
                              }}
                              onTouchEnd={(e) => {
                                  e.stopPropagation();
                                  const startStr = e.currentTarget.getAttribute('data-touchstart');
                                  if (!startStr) return;
                                  const startX = parseFloat(startStr);
                                  const endX = e.changedTouches[0].clientX;
                                  const diff = startX - endX;
                                  if (Math.abs(diff) > 20) {
                                      try { playPopSound(); } catch(err){}
                                      if (diff > 0) {
                                          setFrontCardIndex((prev) => (prev + 1) % infoImages.length);
                                      } else {
                                          setFrontCardIndex((prev) => (prev === 0 ? infoImages.length - 1 : prev - 1));
                                      }
                                      setTimeout(() => e.currentTarget.setAttribute('data-swiping', 'false'), 50);
                                  } else {
                                      e.currentTarget.setAttribute('data-swiping', 'false');
                                  }
                              }}
                          >
                              {infoImages.map((img, idx) => {
                                const isFront = frontCardIndex === idx;
                                const isLeft = (frontCardIndex + 1) % 3 === idx;
                                
                                let transformClass = "";
                                let zIndex = "z-10";
                                
                                if (isFront) {
                                    transformClass = "hover:-translate-y-4 hover:scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.5)]";
                                    zIndex = "z-20";
                                } else if (isLeft) {
                                    transformClass = "-rotate-12 -translate-x-12 hover:-translate-y-6 hover:-rotate-[15deg] hover:z-30 opacity-90";
                                } else {
                                    transformClass = "rotate-12 translate-x-12 hover:-translate-y-6 hover:rotate-[15deg] hover:z-30 opacity-90";
                                }
                                
                                const titles = ["Eğitimde Eşitsizliği Bitireceğiz", "Eğitimde Hamle", "Sosyal Politika"];
                                
                                return (
                                    <div 
                                        key={img}
                                        className={`absolute ${isFront ? 'w-[75%] h-72' : 'w-[70%] h-64'} rounded-3xl overflow-hidden shadow-2xl border-4 border-white cursor-pointer transition-all duration-500 ${transformClass} ${zIndex}`}
                                        onClick={(e) => {
                                            const isSwiping = e.currentTarget.parentElement?.getAttribute('data-swiping') === 'true';
                                            if (isSwiping) return;
                                            
                                            if (isFront) {
                                                setSelectedImage(img);
                                                try { playPopSound(); } catch(err){}
                                            } else {
                                                setFrontCardIndex(idx);
                                                try { playPopSound(); } catch(err){}
                                            }
                                        }}
                                    >
                                        <img src={img} alt={titles[idx]} className="w-full h-full object-cover object-top" />
                                        <div className={`absolute inset-0 flex items-center justify-center ${isFront ? 'bg-gradient-to-t from-black/80 via-transparent to-transparent items-end p-4' : 'bg-black/40'}`}>
                                            {isFront ? (
                                                <div className="text-white text-center w-full">
                                                    <span className="font-black text-sm uppercase tracking-wide drop-shadow-md">{titles[idx]}</span>
                                                    <div className="w-8 h-1 bg-red-600 mx-auto mt-2 rounded-full"></div>
                                                </div>
                                            ) : (
                                                <span className="bg-red-600 text-white font-black px-4 py-2 rounded-full uppercase text-[10px] tracking-widest shadow-lg text-center">{titles[idx]}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                          </div>
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 mt-4 mb-4">
                             <p className="text-xs font-bold text-gray-400">Bu kategoriye ait infografik yakında eklenecek.</p>
                          </div>
                        )}
                        <p className="text-center text-[10px] font-bold text-gray-400 mt-8 uppercase tracking-widest animate-pulse">İncelemek için kartlara dokunun</p>
                    </div>

                    <div className="w-full max-w-lg mb-8 text-black text-left">
                        <h2 className="font-black text-2xl uppercase italic text-center mb-6 border-b-4 border-red-600 inline-block w-full pb-2">OSMANİYE GÜNDEMİ</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                          {[
                            { id: 1, title: "Kadirli Turp Üreticilerinden Protesto", summary: "Satış fiyatlarını protesto eden turp üreticileri destek bekliyor.", opinion: "Emeğin karşılığı alın teri kurumadan verilmelidir. Fiyat istikrarı sağlanacak!" },
                            { id: 2, title: "Düziçi Eğitimde Geri Kaldı", summary: "Yeni açıklanan verilere göre Düziçi ilçesi eğitim yatırımlarında yetersiz.", opinion: "Düziçi Teknoloji Vadisi projemizle eğitim ve teknolojiyi birleştireceğiz." }
                          ].map((news) => (
                            <div key={news.id} className="min-w-[85%] snap-center bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden shrink-0">
                              <div className="p-6">
                                <div className="flex items-center gap-2 mb-3"><Newspaper className="text-red-600" size={20} /><span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Son Dakika</span></div>
                                <h3 className="font-black text-lg uppercase text-gray-900 leading-tight mb-2">{news.title}</h3>
                                <p className="text-sm font-medium text-gray-600 mb-4">{news.summary}</p>
                                <button onClick={() => setExpandedPromise(expandedPromise === news.id ? null : news.id)} className="w-full bg-red-50 text-red-600 py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-transform">
                                  ENVER ERDOĞAN'IN GÖRÜŞÜ <ChevronDown size={16} className={`${expandedPromise === news.id ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                              {expandedPromise === news.id && (
                                <div className="bg-red-600 p-6 text-white animate-in slide-in-from-top-2 border-t border-red-500">
                                  <p className="text-sm font-bold italic leading-relaxed">"{news.opinion}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                    </div>

                    <div className="w-full max-w-lg mb-8 px-2 text-black text-left">
                        <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
                            <Quote size={12} className="text-red-600" /> OSMANİYE İÇİN SÖZÜNÜ SÖYLEYENLER
                        </h3>
                        <div className="space-y-3">
                            {liveMessages.length > 0 ? liveMessages.map((m) => (
                                <div key={m.id} className="bg-white p-4 rounded-2xl shadow-md border-l-4 border-red-600 text-left animate-in slide-in-from-bottom-2 text-black">
                                    <span className="bg-gray-100 text-gray-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-1 inline-block">
                                        {m.kategori.toUpperCase()}
                                    </span>
                                    <p className="text-xs font-medium text-gray-800 italic">"{m.mesaj}"</p>
                                </div>
                            )) : <p className="text-[10px] text-gray-400 italic text-center">Yorumlar onay sonrası burada görünecek...</p>}
                        </div>
                    </div>

                </div>

                <div className="my-6 bg-red-600 py-3 text-white overflow-hidden shadow-inner relative z-10 text-white w-full max-w-lg mx-auto">
                  <div className="animate-marquee flex gap-12 font-bold text-sm uppercase tracking-widest min-w-full">
                    {[...marqueeMessages, ...marqueeMessages].map((msg, i) => <span key={i} className="flex items-center gap-3 whitespace-nowrap text-white"><Heart size={14} fill="white"/> {msg}</span>)}
                  </div>
                </div>

                <div className="px-5 flex flex-col gap-4 pb-8 w-full max-w-lg mx-auto">
                  <button onClick={() => setShowBioModal(true)} className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-black p-5 rounded-3xl shadow-2xl shadow-black/20 flex items-center justify-between active:scale-95 transition-all group border border-gray-800">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="bg-red-600/20 p-3.5 rounded-2xl border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
                        <User size={26} className="text-red-500" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-black text-[15px] uppercase tracking-widest text-white">BEN KİMİM?</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">ENVER Erdoğan kimdir?</span>
                      </div>
                    </div>
                    <div className="relative z-10 bg-white/10 p-2.5 rounded-full group-hover:bg-red-600 transition-colors duration-300 shadow-inner">
                        <ArrowRight size={18} className="text-gray-300 group-hover:text-white" />
                    </div>
                  </button>

                  <button onClick={() => setShowGoalsModal(true)} className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-800 p-5 rounded-3xl shadow-2xl shadow-red-900/30 flex items-center justify-between active:scale-95 transition-all group border border-red-500">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="bg-black/20 p-3.5 rounded-2xl border border-black/10 group-hover:scale-110 transition-transform duration-300">
                        <Target size={26} className="text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-black text-[15px] uppercase tracking-widest text-white">MECLİS HEDEFLERİM</span>
                        <span className="text-[11px] font-bold text-red-200 uppercase tracking-[0.2em] mt-0.5">Projeler ve Vaatler</span>
                      </div>
                    </div>
                    <div className="relative z-10 bg-black/15 p-2.5 rounded-full group-hover:bg-white transition-colors duration-300 shadow-inner">
                        <ArrowRight size={18} className="text-white group-hover:text-red-700" />
                    </div>
                  </button>

                  <button onClick={() => setActiveTab('iletisim')} className="relative overflow-hidden bg-white p-5 rounded-3xl shadow-2xl flex items-center justify-between active:scale-95 transition-all group border-2 border-gray-100">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 group-hover:scale-110 group-hover:bg-gray-100 transition-transform duration-300 shadow-sm">
                        <MessageSquare size={26} className="text-gray-900" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-black text-[15px] uppercase tracking-widest text-black">SÖZÜNÜ İLET</span>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-0.5">Doğrudan Bize Ulaşın</span>
                      </div>
                    </div>
                    <div className="relative z-10 bg-gray-50 border border-gray-200 p-2.5 rounded-full group-hover:bg-red-600 transition-colors duration-300 shadow-inner">
                        <ArrowRight size={18} className="text-gray-400 group-hover:text-white" />
                    </div>
                  </button>
                </div>
              </div>
            )}


            {activeTab === 'saha' && (
              <div className="p-4 animate-in slide-in-from-bottom-10 duration-500 pb-20 text-black">
                <h2 className="font-black text-2xl uppercase italic text-center mb-6 border-b-4 border-red-600 inline-block w-full pb-2">SAHA RAPORU</h2>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-2 border-red-100 space-y-6">
                  <div className="text-center space-y-2"><p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Söz Sırası Osmaniyelide</p><p className="text-xs font-bold text-gray-500 uppercase leading-relaxed text-black">Gördüğünüz sorunu fotoğraflayın, <br/> çözümü birlikte inşa edelim.</p></div>
                  <form onSubmit={handleSahaSubmit} className="space-y-4">
                    <div className="relative w-full h-56 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden active:scale-[0.98] transition-all">
                      <input type="file" accept="image/*,video/*" capture="environment" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {reportImagePreview ? (
                        reportImage?.type.startsWith('video') ? (
                          <video src={reportImagePreview} className="w-full h-full object-cover opacity-90" autoPlay loop muted playsInline />
                        ) : (
                          <img src={reportImagePreview} alt="Önizleme" className="w-full h-full object-cover opacity-90" />
                        )
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 text-center"><PlusCircle size={32} className="text-red-600 mb-2" /><span className="text-[10px] font-black uppercase tracking-widest px-4 text-black">FOTOĞRAF / VİDEO ÇEK</span></div>
                      )}
                      {reportImagePreview && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-black text-xs uppercase tracking-widest">Değiştir</span>
                        </div>
                      )}
                    </div>
                    <textarea value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} placeholder="Sorunun yeri ve durumu hakkında kısa bilgi verin..." className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-6 text-sm font-bold focus:border-red-600 outline-none min-h-[150px] transition-all text-black" />
                    <button disabled={isUploading} type="submit" className={`w-full py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest transition-all shadow-xl relative overflow-hidden ${isUploading ? 'bg-gray-800 text-white' : 'bg-red-600 text-white active:scale-95 shadow-red-900/20'}`}>
                      {isUploading && <div className="absolute left-0 top-0 bottom-0 bg-red-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>}
                      <span className="relative z-10">{isUploading ? `YÜKLENİYOR... %${Math.round(uploadProgress)}` : "SAHA RAPORUNU GÖNDER"}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'gonullu' && (
              <div className="p-4 animate-in slide-in-from-left-10 duration-500 pb-24 text-black">
                <h2 className="font-black text-2xl uppercase italic text-center mb-2">BİRLİKTE ENVER'LE ZAFERE</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mb-6">Zafer Ordusuna Katıl</p>
                
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-8 shadow-2xl border-4 border-red-200 mb-6 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 opacity-20"><Medal size={160} /></div>
                  <div className="relative z-10">
                    <h3 className="font-black text-3xl mb-1">50</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-4">Mevcut Rozet Puanınız</p>
                    <p className="text-xs font-bold leading-relaxed mb-6">En çok rozet alan gönüllülerimizi belirli periyotlarla Gazi Meclisimizde ağırlıyoruz!</p>
                    <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] font-black uppercase text-red-200 mb-1">Senin Referans Kodun</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-bold tracking-widest">ENV-8372</span>
                        <button onClick={() => alert("Kod kopyalandı!")} className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95">KOPYALA</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <button onClick={() => alert("Saha çalışması fotoğraf yükleme alanı yakında aktif edilecek.")} className="w-full bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white/50 flex items-center justify-between active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600"><Users size={24} /></div>
                      <div className="text-left">
                        <h4 className="font-black text-sm uppercase">Broşür Dağıtımı Bildir</h4>
                        <p className="text-[10px] font-bold text-gray-500">+50 Rozet Puanı</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                  <button onClick={() => alert("Referans kodunuzu girmek için yakında aktif edilecek.")} className="w-full bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white/50 flex items-center justify-between active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Medal size={24} /></div>
                      <div className="text-left">
                        <h4 className="font-black text-sm uppercase">Referans Kodu Gir</h4>
                        <p className="text-[10px] font-bold text-gray-500">+100 Rozet Puanı (İndirtene)</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* ANKET MODULE INTEGRATED INTO GONULLU */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-t-[12px] border-red-600 space-y-8 text-left border-2 border-red-100 mb-6">
                  <div className="flex items-center gap-3">
                    <BarChart2 className="text-red-600" size={24} />
                    <h3 className="font-black text-xl uppercase italic">Gönüllü Anketi</h3>
                  </div>
                  <h4 className="font-black text-lg leading-tight">Osmaniye'nin en acil çözülmesi gereken sorunu hangisidir?</h4>
                  <div className="space-y-5">
                    {[{id:'opt1', label:'Sığınmacı ve güvenlik sorunu'}, {id:'opt2', label:'İşsizlik ve geçim sıkıntısı'}, {id:'opt3', label:'Tarım maliyetlerinin artışı'}, {id:'opt4', label:'Deprem ve altyapı yetersizliği'}, {id:'opt5', label:'Şehirleşme ve teknoloji'}].map((opt) => {
                      const percent = calculatePercent(pollResults[opt.id]);
                      return (
                        <div key={opt.id} className="space-y-2">
                          <button disabled={hasVoted} onClick={() => handleVote(opt.id)} className={`w-full text-left p-5 rounded-2xl border-2 flex justify-between items-center ${hasVoted ? 'bg-gray-50' : 'active:bg-red-50'} border-gray-100`}><span className={`font-black text-xs uppercase ${hasVoted && pollResults[opt.id] > 0 ? 'text-red-600' : ''}`}>{opt.label}</span>{hasVoted ? <span className="font-black text-red-600 text-sm">%{percent}</span> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>}</button>
                          {hasVoted && <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${percent}%` }}></div></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medya' && (
              <div className="animate-in fade-in duration-500 bg-gray-950 min-h-screen -mt-16 pt-20 pb-24 text-white relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/20 to-transparent pointer-events-none"></div>
                <h2 className="font-black text-2xl uppercase italic text-center mb-8 border-b-4 border-red-600 inline-block w-full max-w-xs pb-2 drop-shadow-md mx-auto flex justify-center">VİDEO GALERİSİ</h2>
                <div className="flex flex-col items-center gap-8 px-4 h-[75vh] overflow-y-auto snap-y snap-mandatory hide-scrollbar">
                  {[1, 2, 3].map((vid) => (
                    <div key={vid} className="relative w-full max-w-md aspect-[9/16] bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 snap-center shrink-0">
                      
                      {/* Floating Watermark in Media Tab */}
                      <div onClick={handleWatermarkClick} className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-2xl border border-white/10 cursor-pointer active:scale-95 transition-all z-50 clickable-img">
                        <img src="/zafer-logo.png" className="h-4 w-auto no-drag" alt="Zafer" />
                        <div className="flex flex-col text-left text-white">
                          <span className="font-marka text-[11px] tracking-tight uppercase leading-tight"><span className="text-red-500">ENVER</span><span className="text-white"> ERDOĞAN</span></span>
                        </div>
                      </div>

                      {/* Video Placeholder Background */}
                      <div className="absolute inset-0 bg-[url('/info2.jpg')] bg-cover bg-center opacity-40"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-20 h-20 bg-red-600/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] cursor-pointer hover:scale-110 active:scale-95 transition-all">
                           <Play size={36} className="text-white ml-2" fill="white" />
                         </div>
                      </div>
                      
                      {/* Video Overlay Details */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <div className="flex items-center gap-3 mb-3">
                          <img src="/enver-profil.png" className="w-10 h-10 rounded-full border-2 border-red-600 object-cover bg-white" />
                          <div className="flex flex-col">
                            <span className="font-black text-sm tracking-wide">@envererdogan</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Osmaniye</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium leading-relaxed opacity-90">Osmaniye&apos;nin bereketli toprakları için sözümüz var! Kadirli, Düziçi, Bahçe... <span className="font-black text-red-400">#osmaniye #zaferpartisi #envererdogan</span></p>
                      </div>
                      
                      {/* Action Buttons Right Side */}
                      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
                        <button className="flex flex-col items-center gap-1 hover:scale-110 transition group"><div className="p-3 bg-black/40 rounded-full backdrop-blur-sm group-hover:bg-red-600/40"><Heart size={26} className="text-white" /></div><span className="text-[10px] font-black drop-shadow-md">12.4B</span></button>
                        <button className="flex flex-col items-center gap-1 hover:scale-110 transition group"><div className="p-3 bg-black/40 rounded-full backdrop-blur-sm group-hover:bg-blue-600/40"><MessageCircle size={26} className="text-white" /></div><span className="text-[10px] font-black drop-shadow-md">342</span></button>
                        <button className="flex flex-col items-center gap-1 hover:scale-110 transition group"><div className="p-3 bg-black/40 rounded-full backdrop-blur-sm group-hover:bg-green-600/40"><Share2 size={26} className="text-white" /></div><span className="text-[10px] font-black drop-shadow-md">Paylaş</span></button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] font-bold text-gray-500 mt-4 uppercase tracking-widest animate-pulse">Kaydırarak İzleyin</p>
              </div>
            )}

            {activeTab === 'iletisim' && (
              <div className="p-4 animate-in fade-in duration-500 text-black">
                <h2 className="font-black text-2xl uppercase italic text-center mb-6">SÖZÜM VAR</h2>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-b-8 border-red-600 space-y-5 border-2 border-red-100">
                  <input placeholder="ADINIZ SOYADINIZ" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-xs font-bold focus:border-red-600 outline-none" />
                  <textarea value={citizenIdea} onChange={(e) => setCitizenIdea(e.target.value)} disabled={sentCategories.includes('iletisim')} placeholder="Mesajınız..." className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-xs font-bold focus:border-red-600 min-h-[220px]" />
                  <button onClick={handleIdeaSubmit} disabled={sentCategories.includes('iletisim')} className="bg-red-600 text-white w-full py-5 rounded-2xl font-black uppercase shadow-lg active:scale-95">{sentCategories.includes('iletisim') ? "MESAJINIZ ALINDI" : "MESAJI İLET"}</button>
                </div>
              </div>
            )}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-20 z-[150] px-4 shadow-xl">
            {tabOrder.map((id) => {
              const icons: any = { home: Home, vaatler: TrendingUp, medya: Play, saha: Target, gonullu: Users, iletisim: MessageSquare };
              const labels: any = { home: 'ANA SAYFA', vaatler: 'VİZYON', medya: 'MEDYA', saha: 'SAHA RAPORU', gonullu: "ENVER'LE ZAFERE", iletisim: 'SÖZÜM VAR' };
              const Icon = icons[id];
              return (
                <button key={id} onClick={() => {
                  setActiveTab(id); 
                  setSelectedCategory(null);
                  try { new Audio('/pop.mp3').play().catch(()=>console.log('Audio play ignored')); } catch(e){}
                }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === id ? 'text-red-600 scale-110' : 'text-gray-400 opacity-60'}`}><Icon size={24} strokeWidth={activeTab === id ? 3 : 2} /><span className={`text-[9px] font-black uppercase`}>{labels[id]}</span></button>
              )
            })}
          </nav>
          
          {/* YÜZEN (FLOATING) ÖZEL TASARIM MÜHÜR - SÜREKLİ DÖNEN */}
          <button 
            className="fixed bottom-24 right-4 z-[160] w-[4.5rem] h-[4.5rem] flex items-center justify-center animate-[spin_12s_linear_infinite] hover:scale-110 active:scale-95 transition-transform drop-shadow-[0_10px_20px_rgba(220,38,38,0.4)]"
            onClick={() => {
              setSelectedImage('/zafer-muhur.png');
              try { new Audio('/pop.mp3').play().catch(()=>console.log('Audio play ignored')); } catch(e){}
            }}
          >
            <img src="/zafer-muhur.png" className="w-full h-full object-contain" alt="Mühür İncele" />
          </button>

        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-in fade-in select-none" 
          onClick={() => setSelectedImage(null)} 
          onContextMenu={preventActions}
          onTouchStart={(e) => setImageTouchStartX(e.targetTouches[0].clientX)}
          onTouchEnd={handleImageTouchEnd}
        >
          <button className="absolute top-6 right-6 text-white hover:text-red-500 bg-white/10 p-3 rounded-full shadow-xl z-[2010]"><X size={28} /></button>
          
          {(selectedImage.includes('/info') || selectedImage.includes('merkez')) && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); try { playPopSound(); } catch(e){} navigateImage(-1); }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-red-600 transition-colors z-[2020]"
              >
                <ChevronRight size={32} className="rotate-180" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); try { playPopSound(); } catch(e){} navigateImage(1); }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-red-600 transition-colors z-[2020]"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="relative w-full max-w-4xl max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border-4 border-white/20 clickable-img" onContextMenu={preventActions} onDragStart={preventActions} alt="Lightbox" />
            {(!selectedImage.includes('/info') && !selectedImage.includes('merkez')) && (
                <div onClick={handleWatermarkClick} className="absolute bottom-3 right-3 bg-gray-950/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-2xl border border-white/10 cursor-pointer active:scale-95 transition-all clickable-img">
                    <img src="/zafer-logo.png" className="h-4 w-auto no-drag" alt="Zafer" /><div className="flex flex-col text-left text-white"><span className="font-marka text-[11px] tracking-tight uppercase leading-tight"><span className="text-red-500">ENVER</span><span className="text-white"> ERDOĞAN</span></span><span className="text-white/80 text-[7px] font-black uppercase whitespace-nowrap">Zafer Partisi Osmaniye Milletvekili Aday Adayı</span></div><ExternalLink size={10} className="text-white/30 ml-1 text-white" />
                </div>
            )}
          </div>
          
          {(selectedImage.includes('/info') || selectedImage.includes('merkez')) && (
            <div className="absolute bottom-6 flex gap-2 z-[2010]">
                {(selectedImage.includes('merkez') ? ['/merkez1.png', '/merkez2.png', '/merkez3.png', '/merkez4.png'] : infoImages).map((img, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full transition-all ${selectedImage === img ? 'bg-red-500 w-6' : 'bg-white/30'}`}></div>
                ))}
            </div>
          )}
        </div>
      )}

      {showBioModal && (
        <div className="fixed inset-0 z-[2000] bg-gray-950 flex flex-col text-white animate-in slide-in-from-bottom-full duration-500 overflow-y-auto">
          {/* Header/Cover Image Section */}
          <div className="relative w-full h-[45vh] shrink-0">
            <img src="/enver-kapak.png" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
            <button onClick={() => setShowBioModal(false)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors z-[2010]"><X size={24} /></button>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-3 inline-block shadow-lg">Biyografi & Vizyon</span>
              <h2 className="font-black text-4xl uppercase italic tracking-tighter leading-none mb-2">Enver<br/><span className="text-red-500">Erdoğan</span></h2>
              <p className="text-sm font-bold text-gray-300">Akademisyen, Düşünür & Zafer Partisi Osmaniye Milletvekili Aday Adayı</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 pb-12 space-y-8 -mt-2 relative z-10">
            {/* Quote Card */}
            <div className="bg-gradient-to-br from-red-900/40 to-black p-6 rounded-3xl border border-red-500/30 shadow-[0_10px_30px_rgba(220,38,38,0.15)] relative overflow-hidden">
              <Quote size={80} className="absolute -top-4 -right-4 text-red-500/10 rotate-12" />
              <p className="text-lg leading-relaxed font-medium italic relative z-10">"Ben; bu kadim şehrin dününe bilimle vakıf, bugününe vatan sevdasıyla dertli, yarınına ise sarsılmaz bir inançla aşık bir evladınız olarak, zafere giden yolu hep birlikte yürümeye kararlıyım!"</p>
              <div className="flex justify-end mt-4">
                <button onClick={() => speakText("Ben; bu kadim şehrin dününe bilimle vakıf, bugününe vatan sevdasıyla dertli, yarınına ise sarsılmaz bir inançla aşık bir evladınız olarak, zafere giden yolu hep birlikte yürümeye kararlıyım!")} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
                  <Volume2 size={16} /> Sesli Dinle
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 border-l-2 border-red-900/50 space-y-8 mt-8">
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
                <h3 className="font-black text-xl uppercase text-white mb-2 tracking-tight">Kökler ve Başlangıç</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Osmaniye’nin bereketli topraklarında doğmuş, köklerine sadık, dallarını ise evrensel bilgiyle yeşertmiş bir hemşehrinizim. Çukurova'nın o yiğit, çalışkan ve dürüst karakterini her zaman bir madalya gibi göğsümde taşıdım.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
                <h3 className="font-black text-xl uppercase text-white mb-2 tracking-tight">Akademik İnşa</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Uzun yıllar felsefe, sanat ve çağdaş kültür üzerine yürüttüğüm akademik çalışmalarla, sadece düşünmeyi değil, doğruyu inşa etmeyi ilke edindim. Üniversite kürsülerinden edindiğim bu evrensel vizyonu, memleketimin gerçekleriyle harmanladım.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
                <h3 className="font-black text-xl uppercase text-white mb-2 tracking-tight">Siyasi Duruş</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Bugün, bu entelektüel birikimi ve memleket sevgimi, şehrimizin kronikleşmiş sorunlarını akılcı, bilimsel ve milli bir duruşla çözmek için Zafer Partisi çatısı altında siyasete taşıyorum. Osmaniye’nin tarihine sadık, bugününe sahip çıkan ve o modern geleceği bizzat inşa etmeye muktedir bir iradeyle buradayım.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {showGoalsModal && (
        <div className="fixed inset-0 z-[3000] bg-gray-950/80 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 relative flex-shrink-0">
              <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay"></div>
              <button onClick={() => setShowGoalsModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"><X size={24} /></button>
              <div className="relative z-10 flex items-center gap-4">
                <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/30">
                  <Target size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="font-black text-2xl uppercase tracking-widest text-white leading-none mb-1">MECLİS HEDEFLERİM</h2>
                  <p className="text-red-400 text-[11px] font-bold tracking-[0.2em] uppercase">Projeler ve Kanun Teklifleri</p>
                </div>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto bg-gray-50 flex-1">
              <div className="space-y-3">
                
                {[
                  { title: "YERLİ İSTİHDAM YASASI", desc: "Bölgesel kalkınma için yerel iş gücünü önceleyen istihdam teşvikleri ve yasal düzenlemeler." },
                  { title: "TARIMSAL MARKALAŞMA", desc: "Osmaniye fıstığı ve zeytini başta olmak üzere yöresel ürünlere uluslararası patent alınması." },
                  { title: "SIĞINMACILARIN DÖNÜŞÜ", desc: "Kaçak ve sığınmacıların hukuki çerçevede ülkelerine gönderilmesi için yerel ve ulusal düzeyde çalışmalar." },
                  { title: "GÜVENLİ SOKAKLAR", desc: "Suç oranlarını sıfıra indirmek için teknoloji destekli akıllı şehir güvenlik sistemlerinin entegrasyonu." },
                  { title: "EĞİTİMDE FIRSAT EŞİTLİĞİ", desc: "Tüm dezavantajlı mahallelere ücretsiz teknoloji, yazılım ve bilim atölyeleri kurulması." }
                ].map((goal, idx) => (
                  <div key={idx} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors">
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-[14px] uppercase tracking-wider text-gray-900 group-hover:text-red-600 transition-colors mb-1.5 flex items-center gap-2">
                        {goal.title}
                      </h4>
                      <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                        {goal.desc}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowGoalsModal(false)} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-black uppercase text-[13px] tracking-[0.2em] transition-colors shadow-lg active:scale-[0.98]">
                KAPAT
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}