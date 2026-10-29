'use client';

import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowLeft, BookOpen, Check, ChevronRight, CircleHelp, Compass, Diamond, ExternalLink, Flag, GraduationCap, Menu, RotateCcw, Search, Swords, X } from 'lucide-react';
import { Accordion as AccordionPrimitive, Dialog as DialogPrimitive } from '@animate-ui/react/primitives/radix-ui';
import { lessons, glossary, RULES_URL, STORAGE_KEY } from '@/lib/curriculum';
import { Overview, CardExercise, RuneExercise, TurnExercise, MoveExercise, CombatExercise, FinalExercise } from './exercises';

const Accordion = AccordionPrimitive.Root;
const AccordionItem = AccordionPrimitive.Item;
const AccordionContent = AccordionPrimitive.Content;
function AccordionTrigger({ children, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return <AccordionPrimitive.Header><AccordionPrimitive.Trigger data-slot="accordion-trigger" {...props}>{children}<ChevronRight size={17} /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>;
}
const Dialog = DialogPrimitive.Root;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
function DialogContent({ children, className, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="modal-overlay" /><DialogPrimitive.Content data-slot="dialog-content" className={className} {...props}>{children}<DialogPrimitive.Close className="modal-close" aria-label="ปิดคำถาม"><X size={20} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
const exercises = [Overview, CardExercise, RuneExercise, TurnExercise, MoveExercise, CombatExercise, FinalExercise];
type Mode = 'learn' | 'practice' | 'guide';
type Progress = { completed: number[]; lesson: number };
function validProgress(value: unknown): value is Progress {
  if (!value || typeof value !== 'object') return false;
  const data = value as Progress;
  return Array.isArray(data.completed) && data.completed.every(n => Number.isInteger(n) && n >= 0 && n < lessons.length) && Number.isInteger(data.lesson) && data.lesson >= 0 && data.lesson < lessons.length;
}
export default function Academy() {
  const [mode, setMode] = useState<Mode>('learn'); const [lesson, setLesson] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]); const [exerciseDone, setExerciseDone] = useState(false);
  const [reset, setReset] = useState(0); const [hint, setHint] = useState(false); const [mobileNav, setMobileNav] = useState(false);
  const [quiz, setQuiz] = useState(false); const [answer, setAnswer] = useState<number | null>(null);
  const [query, setQuery] = useState(''); const [hydrated, setHydrated] = useState(false); const [storageStatus, setStorageStatus] = useState('ความคืบหน้าเก็บไว้ในเครื่องนี้');
  const reduced = useReducedMotion();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data: unknown = JSON.parse(saved);
          if (validProgress(data)) { setCompleted(Array.from(new Set(data.completed))); setLesson(data.lesson); }
          else setStorageStatus('ข้อมูลเดิมอ่านไม่ได้ เริ่มบันทึกใหม่');
        }
      } catch { setStorageStatus('อ่านข้อมูลเดิมไม่ได้ ความคืบหน้ารอบนี้อาจไม่ถูกบันทึก'); }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, lesson })); }
    catch { window.setTimeout(() => setStorageStatus('บันทึกไม่ได้ ใช้เรียนต่อได้ในรอบนี้'), 0); }
  }, [completed, lesson, hydrated]);
  const finishExercise = useCallback(() => setExerciseDone(true), []);
  const current = lessons[lesson]; const Exercise = exercises[lesson];
  function goLesson(index: number) { setLesson(index); setMode('learn'); setExerciseDone(false); setHint(false); setReset(n => n + 1); setAnswer(null); setMobileNav(false); }
  function changeMode(next: Mode) { setMode(next); setExerciseDone(false); setHint(false); setMobileNav(false); setReset(n => n + 1); }
  function restart() { setReset(n => n + 1); setExerciseDone(false); setHint(false); }
  function respond(index: number) { setAnswer(index); if (index === current.answer) setCompleted(items => Array.from(new Set([...items, lesson]))); }
  const filtered = glossary.filter(item => item.join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  return <MotionConfig reducedMotion="user"><div className="academy">
    <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`} aria-label="เส้นทางการเรียน">
      <button className="brand" onClick={() => goLesson(0)} aria-label="กลับบทแรก"><span className="brand-mark"><Swords size={20} /></span><span className="brand-type">RIFTBOUND<small>FIELD NOTES</small></span></button>
      <div className="sidebar-intro"><span className="eyebrow">THE BEGINNER’S COMPANION</span><p>คู่มือเล่มเล็ก<br />สำหรับเทิร์นแรกของคุณ</p></div>
      <div className="path-heading"><span>เส้นทางของคุณ</span><span>7 บท</span></div>
      <nav className="lesson-nav">{lessons.map((item, index) => <button key={item.title} onClick={() => goLesson(index)} className={`${mode === 'learn' && lesson === index ? 'active' : ''} ${completed.includes(index) ? 'completed' : ''}`} aria-current={mode === 'learn' && lesson === index ? 'step' : undefined}><span className="lesson-number">{completed.includes(index) ? <Check size={14} /> : `0${index + 1}`}</span><span><strong>{item.title}</strong><small>{item.short}</small></span>{mode === 'learn' && lesson === index && <ChevronRight size={15} />}</button>)}</nav>
      <button className={`sidebar-practice ${mode === 'practice' ? 'active' : ''}`} onClick={() => changeMode('practice')}><Flag size={17} /><span>เกมแรกแบบมีผู้ช่วย<small>ค่อย ๆ ลองไปด้วยกัน</small></span><ArrowRight size={15} /></button>
      <div className="sidebar-bottom"><div className="progress-label"><span>ทีละนิด ก็เล่นเป็น</span><strong>{completed.length}<small> / 7</small></strong></div><div className="progress-bar" role="progressbar" aria-label="บทเรียนที่ผ่านแล้ว" aria-valuenow={completed.length} aria-valuemin={0} aria-valuemax={7}><span style={{ width: `${completed.length / 7 * 100}%` }} /></div><small className="storage-note">{storageStatus}</small><div className="sidebar-footer"><span>PERSONAL FIELD GUIDE</span><Diamond size={12} /></div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" aria-label="ปิดเมนู" onClick={() => setMobileNav(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label={mobileNav ? 'ปิดเมนูบทเรียน' : 'เปิดเมนูบทเรียน'} onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X size={20} /> : <Menu size={20} />}</button><div className="breadcrumb"><Compass size={15} /><span>โต๊ะเรียนของคุณ</span><ChevronRight size={12} /><strong>{mode === 'learn' ? `บทที่ ${lesson + 1}` : mode === 'practice' ? 'ลองเล่น' : 'คู่มือ'}</strong></div><button className="top-help" onClick={() => changeMode('guide')}><BookOpen size={16} /><span>คำศัพท์ติดโต๊ะ</span></button></header>
      <div className="content-wrap"><nav className="mode-nav" aria-label="โหมดการเรียน">{([{ id: 'learn', label: 'เรียนทีละก้าว', icon: GraduationCap }, { id: 'practice', label: 'ลองเล่น', icon: Swords }, { id: 'guide', label: 'เปิดคู่มือ', icon: BookOpen }] as const).map(item => <button key={item.id} onClick={() => changeMode(item.id)} className={mode === item.id ? 'active' : ''} aria-current={mode === item.id ? 'page' : undefined}><item.icon size={16} />{item.label}</button>)}</nav>
      <AnimatePresence mode="wait" initial={false}><motion.div key={`${mode}-${lesson}`} initial={{ opacity: 0, y: reduced ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>
      {mode === 'guide' ? <><div className="page-heading"><div><span className="eyebrow">KEEP IT CLOSE</span><h1>ติดตรงไหน เปิดตรงนี้</h1><p>คำศัพท์สั้น ๆ และสิ่งที่ควรรู้ ก่อนนั่งเล่นกับเด็คจริง</p></div><div className="edition-mark"><BookOpen size={25} /><span>FIELD<br />REFERENCE</span></div></div><section className="guide-layout"><div className="dictionary"><label className="search-box"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="ค้นหา เช่น Rune, ยึดสนาม, Exhaust" aria-label="ค้นหาคำศัพท์" />{query && <button className="icon-button" onClick={() => setQuery('')} aria-label="ล้างคำค้น"><X size={16} /></button>}</label><div className="dictionary-count" role="status">{filtered.length} คำที่ค้นพบ</div>{filtered.length ? <Accordion type="single" collapsible className="glossary">{filtered.map(([english, thai, text]) => <AccordionItem data-slot="accordion-item" value={english} key={english}><AccordionTrigger><span><strong>{english}</strong><small>{thai}</small></span></AccordionTrigger><AccordionContent data-slot="accordion-content"><p>{text}</p></AccordionContent></AccordionItem>)}</Accordion> : <div className="empty-search"><Search size={28} /><h2>ยังไม่พบคำนี้</h2><p>ลองใช้คำสั้น ๆ หรือภาษาอังกฤษที่อยู่บนการ์ด</p><button className="text-button" onClick={() => setQuery('')}>ดูคำศัพท์ทั้งหมด <ArrowRight size={15} /></button></div>}</div><aside className="reference-notes"><div className="paper-note"><span className="eyebrow">FIRST REAL GAME</span><h2>พร้อมนั่งโต๊ะจริง</h2><p>เริ่มด้วยเด็คสำเร็จรูปหนึ่งชุด แล้วบอกคู่เล่นว่าขอเล่นช้า ๆ และอธิบายจังหวะด้วย</p><ul><li>Champion Legend 1 ใบ</li><li>Main Deck อย่างน้อย 40 ใบ<br /><small>รวม Chosen Champion ที่แยกตอนเริ่ม</small></li><li>Rune Deck 12 ใบ</li><li>Battlefield 3 ใบต่อคน<br /><small>Duel สุ่มใช้คนละ 1 ใบ รวม 2 สนาม</small></li><li>เปิดมือ 4 ใบ<br /><small>Mulligan เปลี่ยนได้ไม่เกิน 2 ใบครั้งเดียว</small></li><li>คนที่สองได้ Rune เพิ่ม 1 ใบ<br /><small>เฉพาะ Channel แรกของเกม Duel</small></li></ul></div><div className="source-note"><Diamond size={19} /><h2>อ้างอิงกติกาทางการ</h2><p>Core Rules · 9 ต.ค. 2026<br />บทเรียนย่อสำหรับ Duel</p><a href={RULES_URL} target="_blank" rel="noopener noreferrer">Riot Rules Hub <ExternalLink size={14} /></a><p className="fine-print">ข้อความบนการ์ดอาจเปลี่ยนกติกาพื้นฐาน ถ้ากรณีไหนไม่มีในคู่มือนี้ ให้ตรวจ Core Rules และ Errata</p></div></aside></section></> : <>
      <div className="page-heading"><div><span className="eyebrow">{mode === 'practice' ? 'YOUR FIRST GUIDED GAME' : `CHAPTER 0${lesson + 1} / LEARN BY DOING`}</span><h1>{mode === 'practice' ? 'เล่นเทิร์นแรก ไปด้วยกัน' : current.heading}</h1><p>{mode === 'practice' ? 'ยังไม่ต้องคิดหลายอย่าง เราจะพาตั้งแต่จ่ายทรัพยากร จนได้แต้มแรก' : current.description}</p></div><div className="edition-mark"><span className="edition-number">{mode === 'practice' ? <Flag size={28} /> : `0${lesson + 1}`}</span><span>LEARN.<br />TRY. PLAY.</span></div></div>
      <section className="learning-desk" aria-label="พื้นที่ฝึกเล่น"><div className="desk-board"><div className="board-top-label"><span><span className="live-indicator" />{mode === 'practice' ? 'GUIDED PRACTICE' : 'INTERACTIVE TABLE'}</span><span>ลองกดบนโต๊ะได้เลย</span></div>{mode === 'practice' ? <RuneExercise key={`practice-${reset}`} full onComplete={finishExercise} onReset={restart} /> : <Exercise key={`${lesson}-${reset}`} onComplete={finishExercise} onReset={restart} />}</div><aside className="coach"><div className="coach-heading"><span className="coach-symbol"><Compass size={22} /></span><span>มาลองด้วยกัน<small>YOUR TABLE COMPANION</small></span></div><div className="coach-task"><span className="step-tag">{exerciseDone ? 'ลองทำสำเร็จแล้ว' : 'ภารกิจเล็ก ๆ ตอนนี้'}</span><h2>{exerciseDone ? mode === 'practice' ? 'จากการ์ดในมือ สู่แต้มแรก' : 'เห็นภาพขึ้นแล้วใช่ไหม' : mode === 'practice' ? 'เริ่มที่ Rune สองใบ' : ['รู้จักพื้นที่ของเรา', 'รู้ต้นทุน รู้แรงต่อสู้', 'จ่ายให้ครบ แล้วลงการ์ด', 'เรียงช่วงของเทิร์น', 'พายูนิตไปทำแต้ม', 'ดูผลจากทั้งสองแบบ', 'ลองทางไปแต้มสุดท้าย'][lesson]}</h2><p>{exerciseDone ? mode === 'practice' ? 'คุณลองจ่ายทรัพยากร ลงยูนิต ย้าย ยึด และรักษาสนามแล้ว ลองฝึกซ้ำได้เสมอ' : 'ก่อนขยับไปบทถัดไป ลองตอบคำถามสั้น ๆ เพื่อเช็กว่าเข้าใจจุดสำคัญของบทนี้' : mode === 'practice' ? 'หมุน Rune สองใบเพื่อได้ Energy แล้ว Recycle หนึ่งใบเพื่อได้ Calm Power จากนั้นเล่นการ์ดฝึก' : current.objective}</p></div><div className="coach-divider" /><div className="coach-tip"><span className="tiny-diamond">◇</span><div><strong>ไม่ต้องรีบจำ</strong><p>{mode === 'practice' ? 'กดผิดได้ ไม่มีอะไรเสีย ลองดูข้อความใต้โต๊ะแล้วทำใหม่' : current.insight}</p></div></div><button className="hint-button" onClick={() => setHint(!hint)} aria-expanded={hint}><CircleHelp size={16} />{hint ? 'เก็บคำใบ้' : 'ขอคำใบ้สักนิด'}<ChevronRight className={hint ? 'rotated' : ''} size={15} /></button>{hint && <div className="hint-content">{mode === 'practice' ? 'กด Rune ทั้งสองใบให้ Exhausted ก่อน แล้วกด Recycle ใบใดใบหนึ่ง ตัวเลขใน pool ควรเป็น 2 และ 1' : current.tip}</div>}<div className="coach-bottom">{mode === 'learn' ? <button className="primary-button" disabled={!exerciseDone} onClick={() => { setAnswer(null); setQuiz(true); }}>{completed.includes(lesson) ? 'ทบทวนความเข้าใจ' : 'เช็กความเข้าใจ'}<ArrowRight size={17} /></button> : <button className="primary-button" onClick={restart}><RotateCcw size={16} />เริ่มฝึกอีกครั้ง</button>}<small>{mode === 'practice' ? 'สถานการณ์สอนแบบย่อ · ฝึกซ้ำได้' : exerciseDone ? 'คำถามเดียว พร้อมคำอธิบาย' : 'ทำภารกิจบนโต๊ะก่อน แล้วปุ่มจะพร้อม'}</small></div></aside></section>
      <div className="under-desk"><div><Diamond size={14} /><span>{mode === 'practice' ? 'ไม่ต้องชนะให้เร็ว แค่เข้าใจว่ากำลังทำอะไร' : 'ไม่ต้องเก่งก่อนเริ่ม แค่ลองทีละก้าว'}</span></div><button onClick={restart}><RotateCcw size={14} />เริ่มแบบฝึกนี้ใหม่</button></div>
      {mode === 'learn' && <div className="lesson-footer"><button className="text-button" disabled={lesson === 0} onClick={() => goLesson(lesson - 1)}><ArrowLeft size={16} />บทก่อนหน้า</button><span>{completed.includes(lesson) ? <><Check size={14} />ผ่านบทนี้แล้ว</> : `บทที่ ${lesson + 1} จาก 7`}</span><button className="text-button" onClick={() => lesson < 6 ? goLesson(lesson + 1) : changeMode('practice')}>{lesson < 6 ? 'ดูบทถัดไป' : 'ไปลองเล่น'}<ArrowRight size={16} /></button></div>}
      {completed.length === 7 && <div className="all-complete"><Check size={20} /><p>ผ่านพื้นฐานครบแล้ว! ขั้นต่อไปลองเด็คจริงกับคู่เล่น แล้วเปิดคู่มือนี้ข้าง ๆ ได้เลย</p></div>}
      </>}
      </motion.div></AnimatePresence>
      <footer className="colophon"><span>RIFTBOUND FIELD NOTES <span> / </span> ค่อย ๆ เรียน แล้วค่อย ๆ เล่น</span><a href={RULES_URL} target="_blank" rel="noopener noreferrer">กติกาทางการ <ExternalLink size={12} /></a><small>คู่มือแฟนเมดส่วนตัว · ไม่เกี่ยวข้องกับ Riot Games<br />ภาพประกอบ © Riot Games · การ์ดฝึกไม่ใช่การ์ดจริง</small></footer>
      </div>
    </main>
    <Dialog open={quiz} onOpenChange={setQuiz}><DialogContent className="quiz-dialog"><div className="quiz-eyebrow"><Diamond size={16} />ONE SMALL CHECK</div><DialogTitle data-slot="dialog-title">ลองคิดอีกนิด</DialogTitle><DialogDescription data-slot="dialog-description">บทที่ {lesson + 1} · {current.title} ตอบผิดก็ลองใหม่ได้</DialogDescription><h2 className="quiz-question">{current.question}</h2><div className="quiz-options">{current.options.map((option, index) => <button key={option} onClick={() => respond(index)} disabled={answer === current.answer} className={answer === index ? index === current.answer ? 'correct' : 'incorrect' : ''}><span>{answer === index ? index === current.answer ? <Check size={16} /> : <X size={16} /> : String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{answer !== null && <div className={`quiz-feedback ${answer === current.answer ? 'success' : ''}`} role="status"><strong>{answer === current.answer ? 'ใช่เลย เข้าใจจุดสำคัญแล้ว' : 'เกือบแล้ว ลองอีกคำตอบได้เลย'}</strong><p>{answer === current.answer ? current.explanation : 'ลองย้อนนึกถึงสิ่งที่เพิ่งทำบนโต๊ะ หรือปิดหน้าต่างเพื่อกลับไปลองอีกครั้ง'}</p></div>}{answer === current.answer && <button className="primary-button" onClick={() => { setQuiz(false); if (lesson < 6) goLesson(lesson + 1); else changeMode('practice'); }}>{lesson < 6 ? 'ไปบทถัดไป' : 'ไปลองเล่นจริงบนโต๊ะฝึก'}<ArrowRight size={17} /></button>}<a className="quiz-source" href={RULES_URL} target="_blank" rel="noopener noreferrer">Core Rules {current.rule}<ExternalLink size={12} /></a></DialogContent></Dialog>
  </div></MotionConfig>;
}
