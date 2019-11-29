import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import portalTemplates from 'portal-builder-ember/portal-component-generators/all';
import { set } from '@ember/object';
import LiquidEngine from 'portal-builder-ember/utils/liquid-renderer';

export default Controller.extend({
  portalData: service('portal-data'),
  router: service(),

  async addComponentToPreview(componentId) {
    let selectedOptions = portalTemplates[componentId]().selectedOptions;
    let component = portalTemplates[componentId]();
    // translate liquid template to htmlTemplate
    let htmlTemplate = await this.getHtml(component.constructLiquidString(selectedOptions));
    component.htmlString = htmlTemplate;
    set(this, 'currentPageComp', component);
  },
  
  async getHtml(liquidTemplate) {
    let portalData = await this.portalData.loadData();
    let htmlTemplate = await LiquidEngine(liquidTemplate, { portal: portalData });
    return htmlTemplate;
  },
  
  actions: {
    async updateField(currentPageComp, option, selected) {
      currentPageComp.selectedOptions[option.keyName] = selected.target.value;
      let htmlTemplate = await this.getHtml(currentPageComp.constructLiquidString(currentPageComp.selectedOptions));
      set(currentPageComp, 'htmlString', htmlTemplate);

      this.notifyPropertyChange('currentPageComp');
    },
    doneSave() {
      set(this, 'portalData.footer', this.currentPageComp);

      this.router.transitionTo('full-preview-route');
    }
  }
});
