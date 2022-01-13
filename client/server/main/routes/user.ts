import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { db } from "../../database/config/db";
import { verifyToken } from "./middlewares";

const router: express.Router = express.Router();

router.get("/login", async (req: Request, res: Response) => {
    res.send({ data: "data1" });
});
router.get("/register", (req, res: Response) => {
    res.send({ data: "data2" });
});

router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);

    db.query(
        `SELECT * FROM student WHERE email='${email}'`,
        (err, rows: any) => {
            if (err) {
                console.log(err);
                return res.send({ data: "fail" });
            }
            if (rows.length === 0) {
                return res.send({ data: "failEmail" });
            }
            bcrypt.compare(password, rows[0].password, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send({ data: "failPassword" });
                } else if (result == false) {
                    return res.send({ data: "failPassword" });
                }

                const token = jwt.sign(
                    {
                        email,
                    },
                    process.env.ACCESS_TOKEN_SECRET as string,
                    {
                        expiresIn: "5m", // 만료 : 5분
                        issuer: "chs", // 발행자
                    }
                );
                return res.cookie("x_auth", token).status(200).json({
                    message: "tokenOk",
                    token: token,
                });
                // return res.status(200).json({
                //     message: 'tokenOk',
                //     token: token
                // })
            });
        }
    );
});

router.get("/auth", verifyToken, (req: Request, res: Response) => {
    res.send({ user: (<any>req).decoded.email });
});

router.get("/logout", (req, res) => {
    res.clearCookie("x_auth");
    res.send({ success: "logout" });
});

router.post("/register", async (req, res) => {
    const email = req.body.user.email;
    const password = req.body.user.password;
    const hash = await bcrypt.hash(password, 12);

    if (email == "") {
        return res.send({ data: "emptyEmail" });
    }
    if (password == "") {
        return res.send({ data: "emptyPassword" });
    }
    const registerUser = (email: any, password: any) => {
        const sql = `INSERT INTO student(email,password) VALUES ("${email}","${password}")`;
        db.query(sql, (err, results) => {
            if (err) {
                return res.send({ data: "fail" });
            }
            return res.send({ data: "success" });
        });
    };

    registerUser(email, hash);
});

export = router;
