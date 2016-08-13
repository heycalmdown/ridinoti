# 리디북스 노티 긁으머

@d3m3vilurr 옹의 [ridinoti2pushbullet](https://github.com/d3m3vilurr/ridinoti2pushbullet)을 베낌.

[Pushbullet](https://www.pushbullet.com)을 안 쓰기 때문에 텔레그램 [봇 API](https://core.telegram.org/bots)를 사용했음. 
추가로 마땅히 돌릴만한 서버가 없어서 AWS Lambda에서 돌릴 수 있도록 수정.

AWS Lambda에서는 임시로 파일을 저장해놓을 공간이 없기 때문에 S3 지원을 추가.

## 사용법

1. `config.json.sample`을 `config.json`으로 복제
1. `TELEGRAM_TOKEN`은 봇 토큰임. 알아서 잘 만들어 구한다.
1. `TELEGRAM_ID`는 유저의 `chat_id`임. 이것도 알아서 잘 만들어 구한다.
1. `npm i`
1. `node .`