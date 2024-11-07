'use strict';
import axios from 'axios';

const baseurl = 'https://bard.rizzy.eu.org';

class Bard {
  constructor(timeout = 5000) {
    this.axiosInstance = axios.create({
      baseURL: baseurl,
      timeout: timeout,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async question({ ask }) {
    if (!ask) {
      throw new Error('Please specify a question!');
    }

    try {
      const response = await this.axiosInstance.post('/api/onstage', { ask });
      this.logSuccess('question', response);
      return response.data;
    } catch (error) {
      this.logError('question', error);
      throw this.createErrorMessage(error);
    }
  }

  async questionWithImage({ ask, image }) {
    if (!ask) {
      throw new Error('Please specify a question!');
    }

    if (!image) {
      throw new Error('Please specify a URL for the image!');
    }

    try {
      const response = await this.axiosInstance.post('/api/onstage/image', { ask, image });
      this.logSuccess('questionWithImage', response);
      return response.data;
    } catch (error) {
      this.logError('questionWithImage', error);
      throw this.createErrorMessage(error);
    }
  }

  logSuccess(method, response) {
    console.log(`[SUCCESS] ${method}:`, response.status, response.data);
  }

  logError(method, error) {
    console.error(`[ERROR] ${method}:`, error.response ? error.response.status : error.message);
  }

  createErrorMessage(error) {
    if (error.response) {
      return new Error(`API Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      return new Error(`Network Error: No response received`);
    } else {
      return new Error(`Error: ${error.message}`);
    }
  }
}

export default Bard;
