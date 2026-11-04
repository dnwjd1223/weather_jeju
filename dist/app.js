'use strict';
const places = {
  jeju: { name: '제주시', q: '33.4996,126.5312' },
  seogwipo: { name: '서귀포', q: '33.2541,126.5601' },
  seongsan: { name: '성산', q: '33.4386,126.9156' },
  hallim: { name: '한림', q: '33.4101,126.2672' }
};
const $ = id => document.getElementById(id);
let selected = 'jeju';
let apiKey = '';
try { apiKey = sessionStorage.getItem('jeju-weather-api-key') || ''; } catch {}
let requestController;
let requestNumber = 0;
const number = (value, digits = 0) => Number.isFinite(value) ? value.toFixed(digits) : '—';
function setStatus(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}
function clearWeather() {
  ['temp', 'wind', 'humidity', 'rain', 'uv'].forEach(id => $(id).textContent = '—');
  $('feels').textContent = '—';
  $('condition').textContent = '제주의 날씨를 만나보세요';
  $('wind-note').textContent = '풍향 —';
  $('uv-note').textContent = '자외선 지수';
  $('updated').textContent = '아직 날씨 데이터가 없습니다.';
  $('tip').textContent = '지역을 선택하면 그곳의 현재 날씨를 확인할 수 있어요.';
}
function render(data) {
  const c = data.current;
  if (!c || !Number.isFinite(c.temp_c)) throw new Error('날씨 응답을 읽을 수 없습니다. 다시 시도해주세요.');
  $('temp').textContent = number(c.temp_c);
  $('condition').textContent = c.condition?.text || '현재 날씨';
  $('feels').textContent = number(c.feelslike_c) + '°C';
  $('wind').textContent = number(c.wind_kph / 3.6, 1);
  $('humidity').textContent = number(c.humidity);
  $('rain').textContent = number(c.precip_mm, 1);
  $('uv').textContent = number(c.uv, 1);
  const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
  $('wind-note').textContent = Number.isFinite(c.wind_degree) ? `${directions[Math.round(c.wind_degree / 22.5) % 16]}풍 · ${c.wind_degree}°` : '풍향 정보 없음';
  $('uv-note').textContent = !Number.isFinite(c.uv) ? '자외선 정보 없음' : c.uv < 3 ? '낮음' : c.uv < 6 ? '보통 · 자외선 차단을 챙겨요' : c.uv < 8 ? '높음 · 그늘을 이용해요' : '매우 높음 · 햇빛에 주의하세요';
  $('updated').textContent = `${c.last_updated || '—'} (현지 시각) 업데이트`;
  $('weather-art').style.opacity = c.is_day === 0 ? '.65' : '1';
  $('tip').textContent = c.precip_mm > 0 ? '비가 내리고 있어요. 우산을 챙기고, 젖은 돌길에서는 천천히 걸어요.' : c.wind_kph >= 30 ? '바람이 강한 편이에요. 해안가에서는 소지품과 발걸음에 주의하세요.' : c.temp_c < 12 ? '서늘한 제주의 공기, 바람을 막아줄 겉옷을 챙겨보세요.' : c.uv >= 6 ? '햇살이 강해요. 모자와 자외선 차단제를 챙기면 더 편안한 산책이 될 거예요.' : '바람이 달라질 수 있으니 가벼운 겉옷을 챙기고, 나만의 속도로 제주를 걸어보세요.';
  setStatus(`${places[selected].name}의 현재 날씨입니다. 다른 지역을 눌러 그곳의 날씨도 살펴보세요.`);
}
async function loadWeather() {
  if (!apiKey) { $('key-dialog').showModal(); $('api-key').focus(); return; }
  requestController?.abort();
  requestController = new AbortController();
  const controller = requestController;
  const request = ++requestNumber;
  clearWeather();
  $('condition').textContent = '현재 날씨를 불러오는 중';
  $('refresh').disabled = true;
  setStatus(`${places[selected].name}의 날씨를 불러오고 있습니다…`);
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const params = new URLSearchParams({ key: apiKey, q: places[selected].q, lang: 'ko', aqi: 'no' });
    const response = await fetch('https://api.weatherapi.com/v1/current.json?' + params, { signal: controller.signal });
    const data = await response.json();
    if (request !== requestNumber) return;
    if (!response.ok || data.error) {
      const code = data.error?.code;
      throw new Error([1002, 2006].includes(code) ? 'API 키가 올바르지 않습니다. API 키 설정에서 확인해주세요.' : code === 2007 ? 'API 월간 요청 한도를 초과했습니다.' : code === 2008 ? '사용이 중지된 API 키입니다. 키 상태를 확인해주세요.' : '날씨를 불러오지 못했습니다. API 키와 연결 상태를 확인해주세요.');
    }
    render(data);
  } catch (error) {
    if (request !== requestNumber) return;
    clearWeather();
    $('condition').textContent = '잠시 연결이 어려워요';
    setStatus(error.name === 'AbortError' ? '요청 시간이 초과되었습니다. 새로고침으로 다시 시도해주세요.' : error instanceof TypeError ? '연결을 확인하고 다시 시도해주세요.' : error.message, true);
  } finally {
    clearTimeout(timeout);
    if (request === requestNumber) $('refresh').disabled = false;
  }
}
document.querySelectorAll('[data-place]').forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.place;
  document.querySelectorAll('[data-place]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  $('place-name').textContent = places[selected].name;
  if (apiKey) loadWeather();
}));
$('settings').addEventListener('click', () => { $('key-dialog').showModal(); $('api-key').focus(); });
$('close-dialog').addEventListener('click', () => $('key-dialog').close());
$('refresh').addEventListener('click', loadWeather);
$('key-form').addEventListener('submit', event => {
  event.preventDefault();
  const key = $('api-key').value.trim();
  if (!key) { $('api-key').setCustomValidity('API 키를 입력해주세요.'); $('api-key').reportValidity(); return; }
  apiKey = key;
  try { sessionStorage.setItem('jeju-weather-api-key', key); } catch {}
  $('api-key').value = '';
  $('key-dialog').close();
  loadWeather();
});
$('api-key').addEventListener('input', () => $('api-key').setCustomValidity(''));
$('today').textContent = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
loadWeather();
