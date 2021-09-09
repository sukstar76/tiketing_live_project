## 설명

- 좌석 예매, 에매 취소, 선택, 선택 취소 구현
- user 구현 x

## 좌석 예매, 예매 취소

- 간단하게 db access (미구현)

## 좌석 선택, 취소

- redis에 저장 <br>
- key는 (itemId:seatId)
- redis의 속도적 측면을 활용

## Kafka Message

- key를 설정하여 순서 보장
- value 에 seat 정보
