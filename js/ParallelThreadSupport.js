/*
 * Version 0.0.2 ( 2023/11/21 )
 * 現在、サポートする繰り返し処理は次のとおりです。
 * LoopForEver(ずっと繰り返す)
 * LoopRepeat( 〇回繰り返す )
 * LoopRepeatUntil ( 〇〇が成立するまで繰り返す)
 * 今後増やしていく予定です。
 */
p5.prototype.registerMethod('init', function () {
  const p = this;
  p.Wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // await Wait(2) により 2ms ～ 4ms 停止する感じ
  const UntilMs = 2;
  p.Until = async (condition, callback) =>
    new Promise(async (resolve) => {
      for (;;) {
        if (condition()) {
          break;
        }
        await p.Wait(UntilMs);
      }
      if (callback) {
        callback();
      }
      resolve();
    });
  p.MethodRegister = class {
    constructor(self) {
      this.self = self;
      this.regester = new Map();
      this.waitCancel = false;
    }
    isRegisted(_f) {
      return this.regester.has(_f);
    }
    regist(_f, _wrap) {
      if (!this.isRegisted(_f)) {
        this.regester.set(_f, _wrap);
      }
    }
    getWrapMethod(_f) {
      return this.regester.get(_f);
    }
    setWaitCancel(_cancel = true) {
      this.waitCancel = _cancel;
    }
  };
  p.Control = class {
    constructor(_methodRegister) {
      this.mr = _methodRegister;
    }
    LoopForEver(_f) {
      const mr = this.mr;
      if (!mr.isRegisted(_f)) {
        const wrapper = async () => {
          for (;;) {
            await _f();
            await p.Until(
              () => mr.waitCancel === true,
              () => (mr.waitCancel = false)
            );
          }
        };
        mr.regist(_f, wrapper);
      }
      const wrapper = mr.getWrapMethod(_f);
      return wrapper;
    }
    LoopRepeat(_count, _f) {
      const mr = this.mr;
      if (!mr.isRegisted(_f)) {
        const wrapper = async () => {
          for (let i = 0; i < _count; i++) {
            await _f();
            await p.Until(
              () => mr.waitCancel === true,
              () => (mr.waitCancel = false)
            );
          }
        };
        mr.regist(_f, wrapper);
      }
      const wrapper = mr.getWrapMethod(_f);
      return wrapper;
    }
    LoopRepeatUntil(_conditionalFunction, _f) {
      const mr = this.mr;
      if (!mr.isRegisted(_f)) {
        const wrapper = async () => {
          while (true) {
            if (_conditionalFunction()) break;
            await _f();
            await p.Until(
              () => mr.waitCancel === true,
              () => (mr.waitCancel = false)
            );
          }
        };
        mr.regist(_f, wrapper);
      }
      const wrapper = mr.getWrapMethod(_f);
      return wrapper;
    }
  };
});
