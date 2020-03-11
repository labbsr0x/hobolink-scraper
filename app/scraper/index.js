var debug = require('debug')('debug')
const BrowserClient = require('./browser')

class Scraper {
  constructor() {
      const client = new BrowserClient();
      this.browserClient = client;
      this.cameraInterval = null;
  }

  async Login(username, password) {
    await this.browserClient.Launch();
    await this.browserClient.GoTo('https://hobolink.com/', '#content > #j_idt30 > #login-form #login-form\\:j_idt34')
    await this.browserClient.Click('#content > #j_idt30 > #login-form #login-form\\:j_idt34')
    await this.browserClient.Type('#content > #j_idt30 > #login-form #login-form\\:j_idt34', username)
    await this.browserClient.Type('input[name=login-form\\:j_idt36]', password)
    await this.browserClient.Wait('#content > #j_idt30 > #login-form > #login-panel-login-button > .login-button')
    await this.browserClient.Click('#content > #j_idt30 > #login-form > #login-panel-login-button > .login-button', 'Login button clicked')
    return this
  }

  TurnCameraOn(interval) {
    let idx = 1;
    this.cameraInterval =  setInterval(() => {
      this.browserClient.printPDF(`./screenshots/pdf_${idx++}.pdf`)
    }, interval);
  }

  TurnCameraOff() {
    clearInterval(this.cameraInterval);
  }

  async DownloadAllSensorsDailyData(name, date) {
    await this.GoToExportSection()
    await this.browserClient.Wait('#dataTabView\\:savedDataQueryListForm\\:sq-container > #sq-panel-buttons > #sq-panel-buttons-create > #dataTabView\\:savedDataQueryListForm\\:j_idt146 > .ui-button-text', 'Esperando Botão de Criar Export ser Carregado na Tela')
    await this.browserClient.Click('#dataTabView\\:savedDataQueryListForm\\:sq-container > #sq-panel-buttons > #sq-panel-buttons-create > #dataTabView\\:savedDataQueryListForm\\:j_idt146 > .ui-button-text', 
    'Clicando em Criar Export', '#queryBuilderForm\\:general_content > #queryBuilderForm\\:name-panel-grid > #queryBuilderForm\\:j_idt151 #queryBuilderForm\\:settingsName')
    await this.browserClient.Type('#queryBuilderForm\\:general_content > #queryBuilderForm\\:name-panel-grid > #queryBuilderForm\\:j_idt151 #queryBuilderForm\\:settingsName', 
    name, 'Inputando nome do Export')
    await this.browserClient.Select('#queryBuilderForm\\:general_content > #queryBuilderForm\\:name-panel-grid > #queryBuilderForm\\:j_idt164 #queryBuilderForm\\:timezone', 
    'UTC', 'Selecionando timezone UTC')
    await this.browserClient.Select('#queryBuilderForm\\:timeRangeOption', '1', 'Selecionando intervalo fixo entre datas')
    await this.browserClient.Wait(5000)
    await this.browserClient.Wait('#queryBuilderForm\\:fromDateMobile_input', 'Esperando input de datas serem carregados')
    
    const [ yyyy, mm, dd ] = date.trim().split('-')

    await this.browserClient.ChangeValue('#queryBuilderForm\\:fromDateMobile_input', `${mm}/${dd}/${yyyy} 00:00`, 'Inputando data de início')
    await this.browserClient.ChangeValue('#queryBuilderForm\\:toDateMobile_input', `${mm}/${dd}/${yyyy} 23:59`, 'Inputando data de fim')
    await this.browserClient.Wait(5000)
    await this.browserClient.HardClick('#queryBuilderForm\\:qb-container-2_toggler', 'Expandindo aba de sensores', 
    '#queryBuilderForm\\:deviceSensorSelectionTree > ul:first-child > li > span:first-child')
    await this.browserClient.Wait(5000)
    await this.browserClient.ClickAll('#queryBuilderForm\\:deviceSensorSelectionTree > ul:first-child > li > span:first-child', 1000, 'Selecionando todos os sensores', 2000)
    const path = await this.browserClient.Download('#queryBuilderForm\\:exportBtn', 'Clicking on range download button')
    return path
  }

  async GoToExportSection() {
    await this.browserClient.Wait('#hobolink-navigation-form > #hobolink-navigation-form\\:j_idt38 > .submenu-icon-data > .ui-widget > a')
    await this.browserClient.Click('#hobolink-navigation-form > #hobolink-navigation-form\\:j_idt38 > .submenu-icon-data > .ui-widget > a', 'Data section expanded')
    await this.browserClient.Wait('#hobolink-navigation-form\\:j_idt38_j_idt43 > ul > li > a:first-child')
    await this.browserClient.HardClick('#hobolink-navigation-form\\:j_idt38_j_idt43 > ul > li > a:first-child', 'Gone to export section')
    await this.browserClient.Wait('#dataTabView\\:savedDataQueryListForm\\:queryTable', 'Custom exports tab expanded')
    
    return this
  }

  async GoToSettingsSection() {
    await this.browserClient.Wait('#hobolink-navigation-form > #hobolink-navigation-form\\:j_idt38 > .submenu-icon-settings > .ui-widget > a')
    await this.browserClient.Click('#hobolink-navigation-form > #hobolink-navigation-form\\:j_idt38 > .submenu-icon-settings > .ui-widget > a', 'Settings section expanded')
    await this.browserClient.Wait('#hobolink-navigation-form\\:j_idt38_j_idt49 > ul > li > a:first-child')
    await this.browserClient.HardClick('#hobolink-navigation-form\\:j_idt38_j_idt49 > ul > li > a:first-child', 'Gone to account section')
    await this.browserClient.Wait('#acct-info-panel-content', 'Account table expanded')
    return this
  }

  async FindExportIndex(name) {
    const rowlist = document.querySelectorAll('#dataTabView\\:savedDataQueryListForm\\:queryTable_data > tr');
    for (let idx  = 0; idx<rowlist.length; idx++) {
      if(rowlist[idx].childNodes[1].innerHTML == name){
        debug('Export Named $o Found', name)
        return idx;
      }
    }
    return  -1;
  }

  async DownloadExport(name) {
    const idx = await this.FindExportIndex(name)
    if (idx === -1){
      debug('Cannot find export with name %o', name)
    } 
    const path = await this.browserClient.Download(`#dataTabView\\:savedDataQueryListForm\\:queryTable\\:${idx}\\:j_idt177`, `Downloading export on idx ${idx}`)    
    return path  
  }

  async ExtractAccountInfo() {
    await this.GoToSettingsSection();
    const [firstName, lastName, email, username] = await Promise.all([
      this.browserClient.GetValue('#settingsTabView\\:hobolink-settings-account-form\\:user-first-name-input', 'Getting first name from account setting'),
      this.browserClient.GetValue('#settingsTabView\\:hobolink-settings-account-form\\:user-last-name-input'),
      this.browserClient.GetValue('#settingsTabView\\:hobolink-settings-account-form\\:user-email-input'),
      this.browserClient.GetHtml('#user-name-value'),
    ]);
    return { firstName, lastName, email, username }
  }

  async ExtractStationsInfo() {
    await this.browserClient.Wait('#hobolink-devices-list-form\\:j_idt147_data')
    const hrefs = await this.browserClient.GetHrefs('#hobolink-devices-list-form\\:j_idt147_data > tr > td:first-child > a')
    console.log('hrefs retrieved ', hrefs);
    const stationsData = []
    for (let idx=0; idx<hrefs.length; idx++) {
      await this.browserClient.GoTo(hrefs[idx], '#device-details-container-tabs\\:hobolink-device-information-panel');
      const [status, nickname, serial_number, model, firmware_version] = await Promise.all([
        this.browserClient.GetHtml('#device-details-container-tabs\\:device-information-tabs\\:device-information-status-value'),
        this.browserClient.GetHtml('#device-details-container-tabs\\:device-information-tabs\\:device-information-general-nickname'),
        this.browserClient.GetHtml('#device-details-container-tabs\\:device-information-tabs\\:device-information-sn-value'),
        this.browserClient.GetHtml('#device-details-container-tabs\\:device-information-tabs\\:device-information-model-value'),
        this.browserClient.GetHtml('#device-details-container-tabs\\:device-information-tabs\\:hobolink-device-information-fw-peripheral-form\\:device-information-fw-peripheral-value'),
      ]);
      stationsData.push({ status, nickname, serial_number, model, firmware_version })
    }
    return stationsData
  }

  async Logout() {
    await this.browserClient.Wait('#hobolink-navigation-form\\:j_idt88 > #header-logged-in-as > #hobolink-navigation-form\\:j_idt90 > #header-log-out-submit > a')
    await this.browserClient.Click('#hobolink-navigation-form\\:j_idt88 > #header-logged-in-as > #hobolink-navigation-form\\:j_idt90 > #header-log-out-submit > a')
    await this.browserClient.Close()
    return this
  }
}
  
module.exports = Scraper;