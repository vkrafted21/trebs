import { Request, Response } from "express";
import axios from "axios";

const FASTAPI_URL = "http://127.0.0.1:8000";

// GET /
export const home = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "failed to connect to fastapi" });
  }
};

// POST /similar
export const findSimilar = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    const response = await axios.post(`${FASTAPI_URL}/similar`, {
      question,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "error finding similar questions" });
  }
};

// POST /add-question
export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { question, year, part, bl } = req.body;

    const response = await axios.post(`${FASTAPI_URL}/add-question`, {
      question,
      year,
      part,
      bl,
    });

    res.json(response.data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "error adding question",
      details: error.response?.data || error.message,
    });
  }
};