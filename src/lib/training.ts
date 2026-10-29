export type Rune = 'ready' | 'exhausted' | 'recycled';
export type TrainingState = {
  runes: Rune[]; energy: number; power: number;
  unit: 'hand' | 'exhausted' | 'ready' | 'field';
  stage: 'pay' | 'awaken' | 'move' | 'showdown' | 'hold' | 'done';
  score: number; message: string; error: boolean;
};
export type TrainingAction = { type: 'exhaust' | 'recycle'; index: number } | { type: 'play' | 'next-turn' | 'move' | 'pass' | 'hold' | 'reset' };
export function initialTraining(): TrainingState {
  return { runes: ['ready', 'ready'], energy: 0, power: 0, unit: 'hand', stage: 'pay', score: 0,
    message: 'ลองหมุน Rune สองใบเพื่อสร้าง 2 Energy ก่อน', error: false };
}
export function train(state: TrainingState, action: TrainingAction): TrainingState {
  const fail = (message: string) => ({ ...state, message, error: true });
  const result = (patch: Partial<TrainingState>, message: string) => ({ ...state, ...patch, message, error: false });
  if (action.type === 'reset') return initialTraining();
  if (action.type === 'exhaust' || action.type === 'recycle') {
    if (state.stage !== 'pay') return fail('ช่วงจ่ายต้นทุนจบแล้ว ลองทำขั้นตอนถัดไปตามผู้ช่วย');
    if (!Number.isInteger(action.index) || action.index < 0 || action.index >= state.runes.length) return fail('ไม่พบ Rune ใบนี้');
    const current = state.runes[action.index];
    if (current === 'recycled') return fail('Rune ใบนี้อยู่ใต้กองแล้ว จึงใช้ซ้ำไม่ได้');
    if (action.type === 'exhaust' && current !== 'ready') return fail('Rune นี้ Exhausted แล้ว จึงสร้าง Energy ซ้ำไม่ได้');
    const runes = [...state.runes];
    if (action.type === 'exhaust') {
      runes[action.index] = 'exhausted';
      return result({ runes, energy: state.energy + 1 }, 'ได้ 1 Energy แล้ว Rune ยังอยู่บนโต๊ะ แต่หมุนใช้ซ้ำไม่ได้ในตอนนี้');
    }
    // This exercise has one card and two runes: avoid an unrecoverable teaching dead-end.
    if (current === 'ready' && state.energy < 2) return fail('Recycle Rune ที่ยัง Ready ได้ตามกติกา แต่โจทย์นี้ต้องใช้ Energy ด้วย ลอง Exhaust ให้ครบ 2 ก่อน จะได้ใช้ทรัพยากรคุ้มขึ้น');
    runes[action.index] = 'recycled';
    return result({ runes, power: state.power + 1 }, 'ได้ 1 Calm Power และส่ง Rune ใบนี้กลับใต้กอง ส่วน Energy ที่สร้างไว้ยังอยู่');
  }
  switch (action.type) {
    case 'play':
      if (state.stage !== 'pay' || state.unit !== 'hand') return fail('การ์ดใบนี้ถูกเล่นไปแล้ว');
      if (state.energy < 2 || state.power < 1) return fail('ยังจ่ายไม่ครบ ต้องใช้ 2 Energy และ 1 Calm Power ดูตัวเลขใน pool ก่อน');
      return result({ energy: state.energy - 2, power: state.power - 1, unit: 'exhausted', stage: 'awaken' }, 'จ่ายครบแล้ว! ยูนิตเข้าฐานแบบ Exhausted จึงยังเดินไม่ได้');
    case 'next-turn':
      if (state.stage !== 'awaken') return fail('ตอนนี้ยังไม่ถึงขั้นเริ่มเทิร์นถัดไป');
      return result({ unit: 'ready', stage: 'move', energy: 0, power: 0, runes: state.runes.map(r => r === 'exhausted' ? 'ready' : r) }, 'ข้ามเทิร์นคู่ต่อสู้ที่ผ่าน ใน Awaken ของเรา ยูนิต Ready แล้ว ตัวอย่างนี้ข้าม Channel และ Draw เพื่อโฟกัสการย้าย');
    case 'move':
      if (state.unit === 'exhausted') return fail('ยูนิตยัง Exhausted อยู่ ต้องรอ Awaken ในเทิร์นถัดไปก่อน Standard Move');
      if (state.stage !== 'move' || state.unit !== 'ready') return fail('ตอนนี้ยังย้ายยูนิตไม่ได้ ทำขั้นตอนที่ผู้ช่วยแนะนำก่อน');
      return result({ unit: 'field', stage: 'showdown' }, 'ยูนิตเดินจาก Base ไปสนามและ Exhaust แม้สนามว่างก็มี Showdown ให้ตอบโต้ก่อน');
    case 'pass':
      if (state.stage !== 'showdown') return fail('ตอนนี้ไม่มี Showdown ที่รอผ่าน');
      return result({ stage: 'hold', score: 1 }, 'ทั้งสองฝ่ายผ่าน Showdown แล้ว เราได้คุมสนามและได้ Conquer 1 แต้ม');
    case 'hold':
      if (state.stage !== 'hold') return fail('ต้องได้คุมสนามและรอ Beginning ถัดไปของเราก่อน');
      return result({ stage: 'done', score: 2 }, 'คู่ต่อสู้ผ่านและไม่ยึดคืน พอถึง Beginning ของเราอีกครั้ง จึงได้ Hold เพิ่ม 1 แต้ม รวมเป็น 2');
  }
}
export function scorePoint(points: number, method: 'hold' | 'conquer', scored: number[], field: number, fieldCount = 2) {
  if (scored.includes(field)) return { points, scored, draw: false, duplicate: true };
  const next = [...scored, field];
  const draw = method === 'conquer' && points >= 7 && next.length < fieldCount;
  return { points: points + (draw ? 0 : 1), scored: next, draw, duplicate: false };
}
export function combat(attacker: number, defender: number) {
  return { attackerSurvives: defender < attacker, defenderSurvives: attacker < defender };
}
