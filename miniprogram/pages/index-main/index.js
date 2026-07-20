const { apiBaseUrl } = require('../../config');

Page({
  data: {
    rValue: '', gValue: '', bValue: '', codResult: '',
    inputValues: Array(10).fill(''), averageCod: '',
    highRangeActive: true, lowRangeActive: false, rangeMode: 'auto',
    isCalculating: false, isAveraging: false,
  },

  onPullDownRefresh() {
    this.setData({ rValue: '', gValue: '', bValue: '', codResult: '', inputValues: Array(10).fill(''), averageCod: '', rangeMode: 'auto', highRangeActive: true, lowRangeActive: false });
    wx.stopPullDownRefresh();
  },
  onClearRGB() {
    this.setData({ rValue: '', gValue: '', bValue: '', codResult: '' });
    wx.showToast({ title: 'RGB \u5df2\u6e05\u9664', icon: 'success' });
  },
  onRInput(event) { this.setData({ rValue: this.validateInput(event.detail.value) }); },
  onGInput(event) { this.setData({ gValue: this.validateInput(event.detail.value) }); },
  onBInput(event) { this.setData({ bValue: this.validateInput(event.detail.value) }); },
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
  request(path, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${apiBaseUrl}${path}`, method: 'POST', data,
        header: { 'content-type': 'application/json' },
        success: (response) => {
          if (response.statusCode >= 200 && response.statusCode < 300) return resolve(response.data.data);
          return reject(new Error(response.data?.error?.message || 'Request failed'));
        },
        fail: () => reject(new Error('Network request failed')),
      });
    });
  },
  async onCalculate() {
    const rgb = this.getRgbValues();
    if (!rgb || this.data.isCalculating) return;
    const [r, g, b] = rgb;
    const range = this.data.rangeMode === 'auto' ? 'auto' : (this.data.highRangeActive ? 'high' : 'low');
    this.setData({ isCalculating: true });
    try {
      const result = await this.request('/api/v1/measurements', { r, g, b, range });
      this.setData({ codResult: result.cod.toFixed(5), highRangeActive: result.range === 'high', lowRangeActive: result.range === 'low' });
    } catch (error) {
      wx.showToast({ title: '\u8ba1\u7b97\u8bf7\u6c42\u5931\u8d25', icon: 'none' });
      console.error(error);
    } finally {
      this.setData({ isCalculating: false });
    }
  },
  switchToHighRange() { this.setData({ highRangeActive: true, lowRangeActive: false, rangeMode: 'manual' }); },
  switchToLowRange() { this.setData({ highRangeActive: false, lowRangeActive: true, rangeMode: 'manual' }); },
  switchToAutoRange() { this.setData({ rangeMode: 'auto' }); },
  onAverageInput(event) {
    const inputValues = [...this.data.inputValues];
    inputValues[event.currentTarget.dataset.index] = this.validateInput(event.detail.value);
    this.setData({ inputValues });
  },
  async onCalculateAverage() {
    const values = this.data.inputValues.filter((value) => value !== '').map(Number).filter(Number.isFinite);
    if (!values.length || this.data.isAveraging) {
      if (!values.length) wx.showToast({ title: '\u8bf7\u8f93\u5165\u6709\u6548\u6570\u636e', icon: 'none' });
      return;
    }
    this.setData({ isAveraging: true });
    try {
      const result = await this.request('/api/v1/cod/average', { values, range: this.data.highRangeActive ? 'high' : 'low' });
      this.setData({ averageCod: result.average.toFixed(5) });
    } catch (error) {
      wx.showToast({ title: '\u5e73\u5747\u503c\u8ba1\u7b97\u5931\u8d25', icon: 'none' });
      console.error(error);
    } finally {
      this.setData({ isAveraging: false });
    }
  },
});
