import Service from '@ember/service';
import { isEmpty } from '@ember/utils';
import { set } from '@ember/object';
import { setProperties } from '@ember/object';
import { layout } from 'portal-builder-ember/portal-component-generators/layout';
import { head } from 'portal-builder-ember/portal-component-generators/head';

export default Service.extend({

  head: head().constructLiquidString(),
  layout: layout().constructLiquidString(),
  portal: null,
  currentPage: '',

  pages: {
    portalHome: [],
    solutionsHome: [],
    discussionsHome: [],
    discussions: [],
    newTicket: [],
    ticketList: [],
    ticketDetails: [],
    topicList: [],
  },

  currentPage: 'portalHome',

  async resolveRequest(api) {
    let iparams = await window.client.iparams.get();
    let constructedUrl = `https://${iparams.freshdesk_subdomain}.freshdesk.com/${api}`;
    let headers = {
      Authorization: "Basic <%= encode(iparam.freshdesk_api_key) %>",
      "Content-Type": "application/json;charset=utf-8"
    };
    let data = await window.client.request.get(constructedUrl, {
      headers
    })
    return JSON.parse(data.response);
  },

  async _loadArticles(folder) {
    let articlesApi = `api/v2/solutions/folders/${folder.id}/articles`
    let articles = await this.resolveRequest(articlesApi);

    setProperties(folder, {
      articles_count: articles.length,
      articles
    })
    return folder;
  },

  async _loadFolders(category) {
    let _this = this;
    let foldersApi = `api/v2/solutions/categories/${category.id}/folders`
    let data = await this.resolveRequest(foldersApi);

    let folders = [];
    data.forEach(async function (folder) {
      folder = await _this._loadArticles(folder);
      folders.push(folder);
    });

    setProperties(category, {
      folders_count: folders.length,
      folders
    })
    return category;
  },

  async loadData() {
    let _this = this;
    if (isEmpty(this.portal)) {
      let categoriesApi = 'api/v2/solutions/categories';
      let categories = await this.resolveRequest(categoriesApi);
      // let foldersApi, folders, articlesApi, articles;
      let solution_categories = [];
      categories.forEach(async function (category) {
        category = await _this._loadFolders(category);
        solution_categories.push(category);
      });
      set(this, 'portalDataValues', { solution_categories });
    }
    return this.portal;
  }
});
