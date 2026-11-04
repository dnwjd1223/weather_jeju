# 지금 제주 날씨는?

HTML, CSS, JavaScript로 만든 제주 현재 날씨 웹앱입니다.

`dist/index.html`을 열고 ‘API 키 설정’에서 WeatherAPI.com API 키를 입력하세요. 또는 이 폴더에서 `node preview.cjs`를 실행한 뒤 `http://localhost:4173`을 여세요.

- API: `https://api.weatherapi.com/v1/current.json`
- 지역: 제주시, 서귀포, 성산, 한림의 위도·경도
- 한국어 날씨 설명: `lang=ko`
- 현재 기온, 체감온도, 풍속(m/s), 습도, 강수량, 자외선
- API 키는 탭의 sessionStorage에 보관하며 탭을 닫으면 삭제됩니다. 화면을 열 때 자동 요청하고 새로고침 버튼으로 다시 요청합니다. 브라우저 직접 요청 방식이므로 개발자 도구에서는 확인 가능합니다.
- API 키가 없거나 요청에 실패하면 임의의 날씨를 표시하지 않습니다.
- current.json 전용 앱이므로 시간별/주간 예보를 포함하지 않습니다.

