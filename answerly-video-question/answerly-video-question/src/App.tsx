import { useEffect, useRef, useState } from "react";
import { Camera, Check, ChevronDown, ImagePlus, Pause, Pencil, Play, Trash2, Upload, Video } from "lucide-react";
import "./styles.css";

type Notice = (message: string) => void;

export default function App() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverName, setCoverName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("Lesson video");
  const [instructions, setInstructions] = useState("");
  const [editing, setEditing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrlRef = useRef<string | null>(null);
  const coverUrlRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const notice: Notice = (message) => window.dispatchEvent(new CustomEvent("answerly-notice", { detail: message }));

  useEffect(() => () => {
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    try { recorderRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  const loadVideo = (file: File) => {
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    const url = URL.createObjectURL(file);
    videoUrlRef.current = url;
    setVideoUrl(url); setVideoName(file.name); setShowPlayer(false); setPlaying(false); notice("Video loaded");
  };
  const loadCover = (file: File) => {
    if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current);
    const url = URL.createObjectURL(file);
    coverUrlRef.current = url; setCoverUrl(url); setCoverName(file.name); notice("Cover image updated");
  };
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return notice("Recording is not supported in this browser");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream; chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => { loadVideo(new File([new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" })], "answerly-recording.webm", { type: recorder.mimeType || "video/webm" })); stream.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
      recorder.start(); recorderRef.current = recorder; setRecording(true); notice("Recording started");
    } catch { notice("Camera and microphone permission is required"); }
  };
  const stopRecording = () => { try { recorderRef.current?.stop(); } catch { /* already stopped */ } recorderRef.current = null; setRecording(false); notice("Recording saved"); };
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return notice("Upload or record a video first");
    if (video.paused) { setShowPlayer(true); void video.play(); setPlaying(true); } else { video.pause(); setPlaying(false); setShowPlayer(false); }
  };
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return notice("Play or load a video before capturing a frame");
    const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob && loadCover(new File([blob], "video-cover.png", { type: "image/png" })), "image/png");
  };
  const deleteMedia = () => {
    if (!window.confirm("Delete this video and cover image?")) return;
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current); if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current);
    videoUrlRef.current = null; coverUrlRef.current = null; setVideoUrl(null); setCoverUrl(null); setVideoName(""); setCoverName(""); setShowPlayer(false); setPlaying(false); notice("Video deleted");
  };

  return <div className="video-app">
    <header className="video-topbar"><div className="video-logo"><span><Video size={17} /></span><div><strong>Answerly</strong><small>Video Question</small></div></div><div className="video-type-select"><small>Question type</small><select defaultValue="video"><option value="video">Video</option><option>Multiple Choice</option><option>Open Ended</option></select><ChevronDown size={14} /></div><button className="preview-button"><Play size={15} /> Preview question</button></header>
    <main className="video-main"><div className="video-title-row"><div><span className="eyebrow">Question authoring</span><h1>Video question</h1><p>Present a focused video lesson with a cover image learners see before playback.</p></div><span className="saved-pill"><Check size={14} /> Draft saved</span></div>
      <div className="video-grid"><section className="video-content"><label className="field-label">Question prompt<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="What should learners answer after watching this video?" /></label><div className="preview-card"><div className="preview-stage">{showPlayer && videoUrl ? <video ref={videoRef} className="visible-player" src={videoUrl} controls autoPlay onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onPlay={() => setPlaying(true)} onPause={() => { setPlaying(false); setShowPlayer(false); }} onEnded={() => { setPlaying(false); setShowPlayer(false); }} /> : <>{coverUrl ? <img src={coverUrl} alt="Selected video cover" /> : <div className="empty-cover"><Video size={44} /><strong>Choose a cover image</strong><span>Your cover appears here before the video starts.</span></div>}<button className="play-button" onClick={togglePlayback} aria-label="Play video">{playing ? <Pause size={26} /> : <Play size={26} fill="currentColor" />}</button></>}{duration > 0 && <span className="duration">{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}</span>}</div><div className="preview-actions"><button onClick={() => setEditing((value) => !value)}><Pencil size={15} /> Edit details</button><button onClick={() => coverInputRef.current?.click()}><ImagePlus size={15} /> Replace cover</button><button onClick={recording ? stopRecording : startRecording}><Camera size={15} /> {recording ? "Stop recording" : "Record again"}</button></div>{editing && <div className="details-panel"><label>Video title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Learner instructions<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Optional instructions" /></label><button onClick={() => { setEditing(false); notice("Details updated"); }}>Done editing</button></div>}</div><div className="info-note"><ImagePlus size={17} /><span>The cover image is shown first. Learners must press Play to start the video.</span></div></section>
        <aside className="video-sidebar"><div className="sidebar-heading"><span>Video source</span><em>{videoUrl ? "Ready" : "Not added"}</em></div><div className="file-name">{videoName || "No video selected"}</div><input ref={videoInputRef} hidden type="file" accept="video/*" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) loadVideo(file); }} /><input ref={coverInputRef} hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) loadCover(file); }} /><button className="side-action primary" onClick={() => videoInputRef.current?.click()}><Upload size={16} /> Upload video</button><button className={`side-action ${recording ? "recording" : ""}`} onClick={recording ? stopRecording : startRecording}><Camera size={16} /> {recording ? "Stop recording" : "Record video"}</button><hr /><div className="sidebar-heading"><span>Cover image</span><ImagePlus size={16} /></div><div className="file-name">{coverName || "No cover selected"}</div><button className="side-action" onClick={() => coverInputRef.current?.click()}><ImagePlus size={16} /> Choose cover</button><button className="side-action" onClick={captureFrame}><Video size={16} /> Capture video frame</button><button className="side-action" onClick={() => setEditing(true)}><Pencil size={16} /> Edit details</button><button className="delete-action" disabled={!videoUrl && !coverUrl} onClick={deleteMedia}><Trash2 size={16} /> Delete video</button></aside>
      </div><footer className="video-footer"><span>Video question · Type 14</span><button className="save-button" onClick={() => notice("Question setup saved")}>Save question</button></footer></main><NoticeToast /></div>;
}

function NoticeToast() { const [message, setMessage] = useState(""); useEffect(() => { const handler = (event: Event) => { setMessage((event as CustomEvent<string>).detail); window.setTimeout(() => setMessage(""), 2200); }; window.addEventListener("answerly-notice", handler); return () => window.removeEventListener("answerly-notice", handler); }, []); return message ? <div className="notice-toast">{message}</div> : null; }
