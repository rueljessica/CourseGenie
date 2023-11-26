/* eslint-disable prettier/prettier */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import path from 'path'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'

export default class FilesController {
  public async show({ response, params }: HttpContextContract) {
    const fileName = params.id;
    const filePath = path.join(Application.publicPath('imgs'), fileName);

    if (fs.existsSync(filePath)) {
      return response.stream(fs.createReadStream(filePath));
    } else {
      const defaultImagePath = path.join(Application.publicPath('imgs'), 'default.png');
      return response.stream(fs.createReadStream(defaultImagePath));
    }
  }
}