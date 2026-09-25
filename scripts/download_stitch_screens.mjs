import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screens = [
  {
    id: "7ae2a4db6ccf45d3839ec93b2bcb37ae",
    name: "01_dashboard",
    title: "Certify Dashboard",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1WfOmYJcHa6wEbeAWIM3PY_jnyc2srN8b0jV_kKAfAz5op0Ye0wS1OP8wHv2LJcnnW7Hao2y6Qkl4X1p-01LVQB-111kGxWwFrJ7gqZaYuCiDZLfjwkWNEIitHG75IC12lisGKkG2zNub-XY1MS-UhkUbJPueyA6RAA0hBUYVZKolqL62vL6PHJp-O9HEQRpCXNkAKB0gt1Ersyzff9mklDRy8fL9HoqzTqwQhbP3ueqpmCX48fob7GBcg",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzI5NmY2OGViNWQwNTc2MzE3OThiMjdjYzUyEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "c9ffd6bb1b2a4dc9804789aa36f5fa37",
    name: "02_explore_courses_catalog",
    title: "Certify - Explore Courses Catalog",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1X99wzaU8LhgwKbJFI3iGUUfRNlnC0_cn-wiYA2dqPE70LagpVEXiON1q4KETna-Ol7XzDaRkgH1BHcWzjJ6q3xh_n-c1IzQIcA_ChBOosiw0zxGrEFRaahq4FCiYGgyjrONFE3rdkbezsfQ0QAgLn_mIfIjXB8PAMfYQuHUtAKEzPRXkg1UKbsnY-yGn97Q3GkBknxqC59c7jJvtRZLd1RtZOlnIDDN2bUoNIJRX_wWmH915LY5V53bg",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzI5YjZjNWUxOTMwMzgzYTM5MzlmMWJkZmIyEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "29bc8fb45c2b45299954f13a0b29b655",
    name: "03_course_catalog_alternate",
    title: "Certify Course Catalog Alternate",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1XUnE9VTJzEGsSpO_ik5NrMPg2TVLpggKdaQAGPtsVjl3WC5138gdHtOYBVfXSeqJ6_NL9E94mHbyVObMegc2r51B3ovZnI4qllVO69HGpUphO6Q3N0jygf5T9ULz-AKHGewppfwe0NusRnaBb6FWVQ3zR4eXFL_H2JCQ90G4WppM3YKdkYLiW-JpmhL9eeIZ1zeRPJQa7skF0_A_kHdsphAI8yZkKW1yHgzDIhLm2DWuzAP6YeqxlTyQ",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzA5YjJiNmQ0NzFhYjRiMDVhMjM2YWZkNjk3YjI3NmQ0EgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  },
  {
    id: "d94fe7900abc419aabdb50e359eeb3d7",
    name: "04_course_overview",
    title: "Python Fundamentals - Course Overview",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1V0JY_RuUtwd2MsTCEJP2e_W3aCu5BMloUsp5HWvKcQPTpKkJPfQvohEN3_u4P4P-2cWQVG5YGJwclmWWVQagkB6RIYNJskHFtyziu5QNEcw0fSIt47Bs6aNIB0ZUg3_whr4uGMrgmGYMlvM6wE5_oFB0v4WWM9ryA9cr4q34lx2HfrLBQaQyOSLNtcM1YArYTnPW0BFF8mpE3U-Gzl8uTIl9-C-Cf37y0nO_N767plity_-Ma_KXpfWQ",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzJhMzQyZGFhM2EwMjJkNjg2NTk3MTBjMGYxEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "aee2466c379d49a2bbd12631088ea0b9",
    name: "05_course_overview_alternate",
    title: "Python Fundamentals - Course Overview Alternate",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1W1YlmtFD6yoJS6H_LC9U-OyXVWNkhlZQg2VZaTjTjEgNoq2rN3viCEAaBrzY99GUJk6qYEjVJ5WHXeUpzxrQyzTqAAw_SFuXKOyw-NaVOM5SX-9ru1tIRJIp27iJebSdu2xV6zVWqJl0K4U-es7ARzkbAwAURA29gUKJB3OlKCuBIW4OBV3rkps_gwYw0vHDIJ055ytRyxwgC19lchKSb0h1NtljBv6mHlfskSbXpR_cAZHn7Asg9FZAI",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzJhMjViNGRhOTYwN2U4NDVlYmQ0MGM1ZTRiEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "86de1ece75644915ad1b92acf8dd65ad",
    name: "06_my_learning_dashboard",
    title: "Certify - My Learning Dashboard",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1Wz9fMGamY8WIbN2eW4622NTsM6vp_qb_spn0mStxsHntVi8FUBA6vF2v1uuHyqHyI6DhgjCvMcvpRV4tOGK4rShITifBGJQWsqcuJ3P3kRzC01ZwOuGpURZy4fxc5ozEbiZP63u1BDCNxIti4I9gznUvxrVZhUEEkPJk92knb70grJsKr-BS3eQ0L5OcdpKO5gAdQ_vL7j2EaW1EqH-YdAoRVoMT_f7-jEAvRxJA1IAQJkx69dmWZ8_bQ",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzI5ZGYwM2NmMjUwMjA3OWNlZTFiMmExOGVlEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "aca1fa697b5f42e1a90c2fec774bdd92",
    name: "07_ai_learning_studio",
    title: "Python Fundamentals - AI Learning Studio",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1XJGI2x7Vhkgf_MI3XSn78LBNLujHE74BTvTVDLfPzBLeWT5u4giGDl3j3RWU5N5Frekw_kJ-eQvednpSdq-2eEZHOuzf6Gw2rKk6onjXLaRQNyctQpAIwNX-IeQD8iVhWJtmIGAt6TMyIEqFayiO0ZN82yo04MG7VuDMhGMcLw9U54mKrEjZeM0UHLF0zBuXIReyK_eOK-_D51lyA5agda4NmmwTecY2jC59qfFl8v9oFV4v6rcNC9XoY",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzJhMGMyMmRkMTQwNzNhZGU3MTIwMjM3MzNhEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "909e5489e8ae4823a72c28ec5cf301ae",
    name: "08_learning_studio_flagship",
    title: "Certify Learning Studio Flagship",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1VQJ-tR75mGm-vwHDvoC-zbS1U0TYiao42XrYBgMbYvuYJMOVH2Qq3wz3VvvR_319mNdtSRx89X8UNEyI4bOupTh0-CLbtHxQ-XgS3Effp6GKMcAUEicvBeXFVnGU9HQ_au1hL1Z--S75yVRAQdQ7qb3hWVur93vY4X_IiJ-_EEPQWFnS9cFZsXTynUoh1vJgVYhxXbWHwsXqKFVhoJFhTWda8Qz1r-tx-ccM5oU5FT0HNCkbw3AMCQOQ",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzY1Y2VkNzY1NGVlODQzYmViM2IzNTY5NDkyMTIzZjVlEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  },
  {
    id: "82985d06b70744d39ca302a7926b3235",
    name: "09_final_assessment",
    title: "Certify - Final Assessment",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1VvrH_Xf-ipBTho8UIqdKkFdpd5sTUqxJN5UOmMTbXZLMg_PqtGd8JNHejoDsk4p0_xrcLJYhgtpqiB97BjS3uHQ6Fw5CYcWA-H7_RZKIj_5kMud_ymMJjaxDb02jjwONHg25FUpROlZ_24Sl_DpA2po0Sdw38bRAxwekHuZ4meoKQAvgnwR_A7gJEievlNZFX3KS4krIe1JM06KuO7fVPON7IdDlRxhP4ozQtXxRCzgGu-WSJpmVdu4us",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzJhNmQyODVhOGUwN2M0ZTViZDc3MDQxMGNhEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "8275d10851394ea98387d9afcbd173db",
    name: "10_chapter_assessment_demo",
    title: "Certify Chapter Assessment & Demonstration Mode",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1WHLGXI3houGiv6Sennkaw-B9tNCaeBAbWlJrR8McP-ZEXWlXn5gin43E-N8Oye2gXA8AzJySX_d47Ld0-qeZFFYY744ke2JgxT-CBrMHFt2CZL7uHy5g5OtYUXd1SjIJXBasB8Y4_4VM4e_Pv0EjvmmAvogLN6jSKAdYQuhC4TewrT6NhIAJecQqnCHmeQVvyw3SX1rVNhMpMkbVD7_AteyjXSKr0QXUKo4UgnP2ttZnFrXCbb-4AS4BU",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZjYzA2ZWNkMmRiZDQ1NDk5ZGE4Mjc0MzNmYjQ3YTE4EgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  },
  {
    id: "fbd5e10d00714d43aee75b1bad177a2a",
    name: "11_diagnostic_pre_assessment",
    title: "Certify Diagnostic Pre-Assessment",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1XTSP85LSBq7X7qH2a1oj3USkyP2Pm08g5TZSFOh_BKFtwyWrnJF-qAngfsQjhiaiLljfy3HMi1VpGairQOKUlm_Dyy0yY1oVuNELrIyO3TXW-gyDekH5J1ndqB-N9m3FP52lEiOQRUbQ_Qjef5aUhoJJOph-8QNxNc2Fd3FB3zINoDEeUyZe6ayUqDKzHtgr6PCmzpuSHbump7SD95PX_BAsBZzcOeGSCyEHeYxY8KA9viVxhwmf-0eT8",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk0ODdiNDAzYzQzMjRkMjZiMTc5ZTQwZDQ4MmMxOWNiEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  },
  {
    id: "9dbe6f95f15d4a1192cf830875be665a",
    name: "12_remediation_studio",
    title: "Certify Remediation Deep-Dive Studio",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1UD4IuB1GTw-IcFDlpKrpAptHTqglV0I76TJaShtc6MxwDlCcMF3xQjb6eBB5tH55IHZQXuPplyy8X4FlTpYTxlguw9Qmy9lTSvAh_Y5l5ASMfsWZNvwZIy5tTkPsKtQ38E4X8PYOIuTJt7AzhK5Nb5aygDgsJNfMJbt5aCMnpwSmc5fC4xPVjDS-SBo5NAYMCosTL2hyVtvv4rakjUMgqA0JehRZqlZCHgsRKBdzK8yJYJEXJB18fpwA",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2UyNmUwNTc4ODA4OTRlNGQ4ZjU2MmEwMWM5MzkwOGEyEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  },
  {
    id: "c12056519a5e4613a992dd80f8b66e6d",
    name: "13_viva_defense_chamber",
    title: "Certify Oral Viva Defense Chamber",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1XOpfbfWVtXpl6J7iY3_T8jXBl3pAkoFbTHCQkA3w64LkzdoiHLV3RzRdXPyLrQ0h79ehpP5sCBGsZKiYPVJl62cquj818S_AZLcrNGuSgd2G4YUEGVCWgZvuAfEq544nC72J9xvMt92HP7s9CBGsm-r2fa4xJiLdMrvcocYJZBSrWy8MKvQOYcRnjzTKo6nh4W3XcLHRubOa9OmIPyBcWRFwYHhNwsvjfV76R83L_szozGpfZDnLNNHQc",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU1YTY2YmRiOWYwZTQxYmM5MmIwNDMzYWY0NWM0Zjg1EgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  },
  {
    id: "121bec711af441399ab1b5907bcbc70d",
    name: "14_certification_result",
    title: "Certify - Certification Result",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1VgaNz19On2lhG3ImqAb-4ibpRpgf9alaKYs-kg4g0o7hSJjqEpBaT1urjMHsH1PVqbBswVMSlKg-d8sqZDqQIV4bDQdhq3TBd9pC2COXP_hU2Log4cn0bwopayRWZPFk6bZqkPUtyWtsrajoDUAQOZvHMiRyBDD-_Y2vFT9JEkAXjb782xRAQLXNV45Gm7DWHyES9BQt-hQYB36LE5o9gsjGbeLd469bO13tpw2_T_g_WTiTJitsKPmdQ",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzJhNTkwNWFhMTAwODBmMDFlNzFkMjc3OTdkEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "1ade17caf8164787a2e252d180f0438c",
    name: "15_my_credentials",
    title: "Certify - My Credentials",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1WL32IX5VC6maw6NlLXzm2egWiq_0JudlLFV8tz-_NUYrtkJ3HMpD8B2mNV1rzYDdvLPM7uKY5JggOSJTyYSLeNl4YS0SW_5r7W0EdA6YT9v6saouOZRGjDejx_BoF5ZRRmU1bDeJ989Ll1DwSPAbjy3mKsgW_tRxd7FNhb4KJx3fzXHLKtQmkZypNFs8vLz0jxlRWSGihpEaZno4YrJcs2nIAKD_Rfx3MCQXbZ7Zjh_Tj4Dl3eTZ9B1-w",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzI5ZWZjZWE0MWUwNTc2MzE3OThiMjdjYzUyEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "a88dca1b7b8947cbb357a946d8e12d0a",
    name: "16_credential_details",
    title: "Certify - Credential Details",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1U1ujgCYHZ-FQc9Sl0tbWv0INfIjKQJpMIG6FoChLSCoeZ3wTzhvcYKNv--lHjjDsCChLiBBVTrShyghDbfhfYKgbLvMC3PLO8vqKOuEIr2E3ISNyGXTPRix7-fuCeSrsWIphandkPB6v7ZJrsSOyw4os1vMEk7JtG7RgUfapAR_owLlh29-KDv65y1b798wr0sokK3u0NQGk4H707gazcagtkUNemTPJnssn1GwEwh1nNvOMaNLi2FFUA",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzJhNDU3YjBhZWYwN2M0ZTViZDc3MDQxMGNhEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "be1355baff4f478ba5951c01450cfd97",
    name: "17_public_verification",
    title: "Certify Public Verification & Credential Ledger",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1Wp3hVOWl2BKEhvfO8DnBCaRzmuvzChY-ovUkuJiNtsBq_CoVEKQF4XgETCJaEdiThrQew2q-H4UKaLeV4NlSDNghoN2ll0K9jzX4cicsd0Aq7A6fs_LGvjTaWNphEZw5YbklMs61PEcjoCiZDSvpbjic9DPzMavwA3jybnaqUmcQix3b_o-HLqf1nnmALaJsl3cOGaeMRkwCZzanVbyIPBJHih5C7yx5WEZMnKeGhQVmtj_f44_thAKBI",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2YzYjQ1NWRkYzAyNzQ1MGFiNWI5ZWI1Zjk2NGY0YzgxEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  },
  {
    id: "cc50adadf7104d9cb7598cfb11090077",
    name: "18_auth_portal",
    title: "Certify Login / Signup Portal",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1WicF7mRiUMDvcdBeV0J_whM71v3_7P4NMB-wmSFpv269kPZ7E1StUNT39OFwHx6On1sFuHxwoBlY6HxLL8zEe9hDSAIjumLP_mAP9JwL_bD6piBblm1YvBP_X4QmymFwT1e8M8iJ-8MtsQABpNAaAsV0cyN2CTwjxZtFhUw9xMz-vawTVzAfum22jmq_aGwv4kf4v0HyUfouUCEejdZWvyGlT5iYw0Ik9Siy-AII1PvzmPDm9P5SHcoeQ",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YzI5NGUwOTcwYzAwMjhmMDlkNjFiMWEwYWQ1EgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=89354086"
  },
  {
    id: "a75d49fa985e47d993059ca51a0384a3",
    name: "19_editorial_landing",
    title: "Certify Editorial Landing Page",
    screenshot: "https://lh3.googleusercontent.com/aida/AEtjO1WSTbykbSJXYRjbaxJ_ESt2FPpyEQyvPr6lgpfFSqNUctn_kXOR2idVRNaDZd0SclPOsgSuHu6bai390NJ65s6DNINr_zv6pBRPZv29ITky-tsOth7tT-NbeiE3BHpsD-3b_a0l7biMoxx_YEBdd1iscmLZBJezB2Pu1VPRQNIRhgghzCcYgkR_UT-4SaZz6FaXOtKVDaLeGBElLGABy2ME4a6Rts1mkMoq42BuojXZuJ1b7-r4tWGW_J4",
    html: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2FiNTM2NTA2Y2FmNzRiOGM5N2ZkNDQ1NjE1ZTBkMzRhEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242"
  }
];

const targetDir = path.resolve(__dirname, '../.stitch/screens');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
}

async function main() {
  console.log(`Starting download of ${screens.length} approved Stitch screens to ${targetDir}...`);
  for (const s of screens) {
    const sDir = path.join(targetDir, `${s.name}_${s.id}`);
    if (!fs.existsSync(sDir)) {
      fs.mkdirSync(sDir, { recursive: true });
    }
    
    // Write metadata
    fs.writeFileSync(path.join(sDir, 'metadata.json'), JSON.stringify(s, null, 2));

    // Download HTML
    const htmlDest = path.join(sDir, 'screen.html');
    if (!fs.existsSync(htmlDest) || fs.statSync(htmlDest).size < 100) {
      console.log(`Downloading HTML for [${s.name}]...`);
      try {
        await downloadFile(s.html, htmlDest);
      } catch (err) {
        console.error(`Error downloading HTML for ${s.name}:`, err.message);
      }
    }

    // Download Screenshot
    const imgDest = path.join(sDir, 'screenshot.png');
    if (!fs.existsSync(imgDest) || fs.statSync(imgDest).size < 100) {
      console.log(`Downloading Screenshot for [${s.name}]...`);
      try {
        await downloadFile(s.screenshot, imgDest);
      } catch (err) {
        console.error(`Error downloading Screenshot for ${s.name}:`, err.message);
      }
    }
  }
  console.log("All Stitch screens downloaded successfully!");
}

main().catch(console.error);
