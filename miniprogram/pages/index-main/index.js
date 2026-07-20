Page({
  data: {
    rValue: '',
    gValue: '',
    bValue: '',
    codResult: '',
    inputValues: Array(10).fill(''),
    averageCod: '',
    highRangeActive: true,
    lowRangeActive: false,
  },

  onPullDownRefresh() {
    this.setData({
      rValue: '',
      gValue: '',
      bValue: '',
      codResult: '',
      inputValues: Array(10).fill(''),
      averageCod: '',
    });
    wx.stopPullDownRefresh();
  },

  onClearRGB() {
    this.setData({ rValue: '', gValue: '', bValue: '', codResult: '' });
    wx.showToast({ title: 'RGB \u5df2\u6e05\u9664', icon: 'success', duration: 2000 });
  },

  onRInput(event) {
    this.setData({ rValue: this.validateInput(event.detail.value) });
  },

  onGInput(event) {
    this.setData({ gValue: this.validateInput(event.detail.value) });
  },

  onBInput(event) {
    this.setData({ bValue: this.validateInput(event.detail.value) });
  },

  validateInput(value) {
    const normalized = String(value).replace(/[^0-9.]/g, '');
    const [integer = '', ...decimals] = normalized.split('.');
    return decimals.length ? `${integer}.${decimals.join('')}` : integer;
  },

  getRgbValues() {
    const values = [this.data.rValue, this.data.gValue, this.data.bValue].map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 255)) {
      wx.showToast({ title: '\u8bf7\u8f93\u5165 0 \u5230 255 \u4e4b\u95f4\u7684 RGB \u6570\u503c', icon: 'none' });
      return null;
    }
    return values;
  },

  onCalculate() {
    const rgb = this.getRgbValues();
    if (!rgb) return;

    const [r, g, b] = rgb;
    const shouldUseHighRange = b <= 10;
    const rangeChanged = shouldUseHighRange !== this.data.highRangeActive;
    const codResult = shouldUseHighRange
      ? this.calculateHighRangeCOD(r, g, b)
      : this.calculateLowRangeCOD(r, g, b);

    this.setData({
      codResult: this.formatResult(codResult),
      highRangeActive: shouldUseHighRange,
      lowRangeActive: !shouldUseHighRange,
    });

    if (rangeChanged) {
      wx.showModal({
        title: '\u63d0\u793a',
        content: `\u5df2\u6839\u636e B \u503c\u81ea\u52a8\u5207\u6362\u5230${shouldUseHighRange ? '\u9ad8\u91cf\u7a0b' : '\u4f4e\u91cf\u7a0b'}`,
        showCancel: false,
        confirmText: '\u786e\u5b9a',
      });
    }
  },

  switchToHighRange() {
    this.setData({ highRangeActive: true, lowRangeActive: false });
  },

  switchToLowRange() {
    this.setData({ highRangeActive: false, lowRangeActive: true });
  },

  calculateHighRangeCOD(r, g, b) {
    const [x1, x2, x3] = [-1713.2, 2280.8, 115.94];
    const [x4, x5, x6] = [13.719, -23.992, -52.244];
    const [x7, x8, x9] = [-0.048843, 0.11181, 7.6064];
    const [x10, x11, x12] = [6.4492e-5, -0.00019355, -0.36434];
    return x1 * r + x2 * g + x3 * b
      + x4 * r ** 2 + x5 * g ** 2 + x6 * b ** 2
      + x7 * r ** 3 + x8 * g ** 3 + x9 * b ** 3
      + x10 * r ** 4 + x11 * g ** 4 + x12 * b ** 4;
  },

  calculateLowRangeCOD(r, g, b) {
    const [x1, x2, x3] = [-271.75, -934.75, 2.3451];
    const [x4, x5, x6] = [1.3166, 4.8288, -0.009684];
    const [x7, x8, x9] = [-0.0021305, -0.0082982, 3.012e-5];
    return 78948 + x1 * r + x2 * g + x3 * b
      + x4 * r ** 2 + x5 * g ** 2 + x6 * b ** 2
      + x7 * r ** 3 + x8 * g ** 3 + x9 * b ** 3;
  },

  formatResult(value) {
    return Number.isFinite(value) ? value.toFixed(5) : '';
  },

  onAverageInput(event) {
    const { index } = event.currentTarget.dataset;
    const inputValues = [...this.data.inputValues];
    inputValues[index] = this.validateInput(event.detail.value);
    this.setData({ inputValues });
  },

  onCalculateAverage() {
    const values = this.data.inputValues
      .filter((value) => value !== '')
      .map(Number)
      .filter(Number.isFinite);

    if (!values.length) {
      wx.showToast({ title: '\u8bf7\u8f93\u5165\u6709\u6548\u6570\u636e', icon: 'none' });
      this.setData({ averageCod: '' });
      return;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    const threshold = this.data.highRangeActive ? 30 : 5;
    const validValues = values.filter((value) => Math.abs(value - median) <= threshold);

    if (!validValues.length) {
      wx.showToast({ title: '\u6570\u636e\u76f8\u5dee\u8fc7\u5927\uff0c\u8bf7\u91cd\u65b0\u6d4b\u91cf', icon: 'none' });
      this.setData({ averageCod: '' });
      return;
    }

    const average = validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
    this.setData({ averageCod: this.formatResult(average) });
  },
});
