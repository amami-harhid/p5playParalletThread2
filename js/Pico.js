p.PicoSprite = class extends p.Sprite {
  constructor(...args) {
    super(...args);
    this.build();
    this.timer = 0;
  }
  build() {
    const mReg = new p.MethodRegister();
    this.mReg = mReg;
    const C = new p.Control(mReg);

    // 入れ子にする場合には asyncを必ずつけること
    // 入れ子には await を必ずつけること
    const _topMethod = C.LoopForEver(async () => {
      await C.LoopRepeat(() => {
        this.x += 1;
      }, 10);
      await C.LoopRepeatUntil(
        (_) => this.x > W,
        () => {
          this.x += 10;
        }
      )();
      this.x = 0;
      await C.LoopRepeat(10, async () => {
        this.rotation += 5;
        await C.LoopRepeat(10, () => {
          this.y += 2;
          if (this.y > H) this.y = 0;
        })();
      })();
    });
    setTimeout(_topMethod, 1000);
  }
  draw() {
    super.draw();
    this.mReg.setWaitCancel();
  }
};
