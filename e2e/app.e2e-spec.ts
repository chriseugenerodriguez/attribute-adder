import { ProductImagePage } from './app.po';

describe('product-image App', () => {
  let page: ProductImagePage;

  beforeEach(() => {
    page = new ProductImagePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
