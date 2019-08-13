import {window} from 'vscode';

// data loading imports
import * as hjson from 'hjson';
import * as json5 from 'json5';
import * as yaml from 'js-yaml';

// json data provider imports
import * as config from '../config';
import * as fileUtils from '../utils/file.utils';
import * as jsonUtils from '../utils/json.utils';
import {Logger, LogLevel} from '../logger';
import {IDataProvider} from '../data.manager';

/**
 * JSON data provider.
 */
export class JsonDataProvider implements IDataProvider {

  // TODO: add mime types later for http data loading
  // TODO: move .config and .yml to separate data.provider impl.
  public supportedDataFileTypes: Array<string> = 
    ['.config', '.json', '.json5', '.hjson', '.yaml', '.yml'];
  
  private logger: Logger = new Logger('json.data.provider:', config.logLevel);

  /**
   * Creates new JSON data provider for .json, .json5, .hjson data files,
   * .config and .yml config files.
   */
  constructor() {
    this.logger.debug('created for:', this.supportedDataFileTypes);
  }

  /**
   * Gets data provider parse function for the specified data file type.
   * @param dataFileType Data file type.
   */
  private getDataParseFunction(dataFileType: string): Function {
    let dataParseFunction: Function = JSON.parse; // default
    switch (dataFileType) {
      case '.json5':
        dataParseFunction = json5.parse;
        break;
      case '.hjson':
        dataParseFunction = hjson.parse;
        break;
      case '.yaml':
      case '.yml':
        dataParseFunction = yaml.load;
        break;
    }
    return dataParseFunction;
  }

  /**
   * Gets local or remote data.
   * @param dataUrl Local data file path or remote data url.
   * @param parseOptions Data parse options.
   * @param loadData Load data callback.
   */
  public getData(dataUrl: string, parseOptions: any, loadData: Function): void {
    let data: any = [];
    // TODO: add mime types later for remote http data loading
    const dataFileType: string = dataUrl.substr(dataUrl.lastIndexOf('.')); // file extension
    try {
      let content: string = fileUtils.readDataFile(dataUrl, 'utf8');
      if (dataUrl.endsWith('.json')) {
        // strip out comments for vscode settings .json config files loading :)
        const comments: RegExp = new RegExp(/\/\*[\s\S]*?\*\/|\/\/.*/g);
        content = content.replace(comments, '');
      }
      const dataParseFunction: Function = this.getDataParseFunction(dataFileType);
      data = dataParseFunction(content);
    }
    catch (error) {
      this.logger.logMessage(LogLevel.Error, `getData(): Error parsing '${dataUrl}' \n\t Error:`, error.message);
      window.showErrorMessage(`Unable to parse data file: '${dataUrl}'. \n\t Error: ${error.message}`);
    }
    loadData(jsonUtils.convertJsonData(data));
  }

  /**
   * Gets data table names for data sources with multiple data sets.
   * @param dataUrl Local data file path or remote data url.
   */
  public getDataTableNames(dataUrl: string): Array<string> {
    return []; // none for json data files
  }

  /**
   * Gets data schema in json format for file types that provide it.
   * @param dataUrl Local data file path or remote data url.
   */
  public getDataSchema(dataUrl: string): any {
    // TODO: auto-gen json schema ???
    return null; // none for json data files
  }

  /**
   * Saves raw Data Provider data.
   * @param filePath Data file path. 
   * @param fileData Raw data to save.
   * @param stringifyFunction Optional stringiy function override.
   */
  public saveData(filePath: string, fileData: any, stringifyFunction: Function): void {
    // TODO
  }
}
