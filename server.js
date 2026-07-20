const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/reports", express.static("reports"));


// =======================
// معلومات الشركات
// =======================

function getCompanyName(company){

    if(company==="aqara")
        return "أكوارا للتمويل";

    if(company==="tamara")
        return "تمارا";

    if(company==="tabby")
        return "تابي";

    return company;

}



function getCompanyRules(company){

    if(company==="aqara"){

        return `
شروط أكوارا للتمويل:

- العسكري:
العمر 22 - 55
مدة الخدمة شهر أو أكثر
الراتب 3000 ريال أو أكثر

- المدني:
العمر 20 - 60
مدة الخدمة شهر أو أكثر
الراتب 3000 ريال أو أكثر

- سعودي قطاع خاص:
العمر 20 - 60
مدة الخدمة 3 أشهر أو أكثر
الراتب 3000 ريال أو أكثر

- مقيم حكومي:
العمر 20 - 50
مدة الخدمة شهر أو أكثر
الراتب 3000 ريال أو أكثر

- مقيم خاص:
العمر 20 - 50
مدة الخدمة 6 أشهر أو أكثر
الراتب 3000 ريال أو أكثر

- المتقاعد:
حتى عمر 70
الراتب 4000 ريال أو أكثر
`;

    }


    if(company==="tamara"){

        return `
شروط تمارا:

- أقل من 18 سنة غير مؤهل
- من 18 إلى 21:
الحد من 200 إلى 1500 ريال

- أكبر من 21:
الحد من 2000 إلى 25000 ريال

يعتمد القبول على السجل الائتماني والالتزام بالدفعات.
`;

    }


    if(company==="tabby"){

        return `
شروط تابي:

- أقل من 18 سنة غير مؤهل
- من 18 إلى 21:
الحد من 200 إلى 1500 ريال

- أكبر من 21:
الحد من 2000 إلى 5000 ريال

يعتمد القبول على السجل الائتماني والالتزام بالدفعات.
`;

    }


    return "";

}




function calculateInstallments(amount){

    if(!amount || amount<=0)
        return "";


    return `
خيارات التقسيط التقريبية:

3 أشهر:
${(amount/3).toFixed(2)} ريال شهرياً

6 أشهر:
${(amount/6).toFixed(2)} ريال شهرياً

12 شهر:
${(amount/12).toFixed(2)} ريال شهرياً

*الأقساط تقريبية وقد تختلف حسب جهة التمويل.
`;

}





app.post("/check",(req,res)=>{


const {

name,
age,
job,
serviceMonths,
salary,
commitments,
company,
productAmount

}=req.body;



let status="rejected";
let message="";
let reason="";



const commitmentRatio =
salary > 0
?
(commitments / salary) * 100
:
100;
// =======================
// فحص أكوارا
// =======================

if(company==="aqara"){


let valid=false;


if(
job==="عسكري" &&
age>=22 &&
age<=55 &&
serviceMonths>=1 &&
salary>=3000
)
valid=true;


else if(
job==="مدني" &&
age>=20 &&
age<=60 &&
serviceMonths>=1 &&
salary>=3000
)
valid=true;


else if(
job==="سعودي خاص" &&
age>=20 &&
age<=60 &&
serviceMonths>=3 &&
salary>=3000
)
valid=true;


else if(
job==="مقيم حكومي" &&
age>=20 &&
age<=50 &&
serviceMonths>=1 &&
salary>=3000
)
valid=true;


else if(
job==="مقيم خاص" &&
age>=20 &&
age<=50 &&
serviceMonths>=6 &&
salary>=3000
)
valid=true;


else if(
job==="متقاعد" &&
age<=70 &&
salary>=4000
)
valid=true;



if(!valid){

reason="عدم توافق شروط العمر أو الوظيفة أو مدة الخدمة أو الراتب";

}

else if(commitmentRatio>40){

reason="نسبة الالتزامات أعلى من 40% من الراتب";

}

else{

status="eligible";

message=
"تم قبولك مبدئياً في أكوارا للتمويل، يرجى إكمال الإجراءات.";

}


}




// =======================
// فحص تمارا
// =======================


else if(company==="tamara"){


if(age<18){

reason="العمر أقل من 18 سنة";

}


else if(age<=21){


if(productAmount>=200 && productAmount<=1500){

status="eligible";

message=
"تم قبولك مبدئياً في تمارا.";

}

else{

reason="المبلغ غير مناسب للفئة العمرية.";

}


}


else{


if(productAmount>=2000 && productAmount<=25000){

status="eligible";

message=
"تم قبولك مبدئياً في تمارا.";

}

else{

reason="المبلغ خارج الحد المسموح.";

}

}


}



// =======================
// فحص تابي
// =======================


else if(company==="tabby"){


if(age<18){

reason="العمر أقل من 18 سنة";

}


else if(age<=21){


if(productAmount>=200 && productAmount<=1500){

status="eligible";

message=
"تم قبولك مبدئياً في تابي.";

}

else{

reason="المبلغ غير مناسب للفئة العمرية.";

}


}


else{


if(productAmount>=2000 && productAmount<=5000){

status="eligible";

message=
"تم قبولك مبدئياً في تابي.";

}

else{

reason="المبلغ خارج الحد المسموح.";

}

}


}



// رفض + اقتراحات

let alternatives="";


if(status==="rejected"){


message =
"تم الرفض: " + reason;



if(company==="aqara"){


alternatives=`

اقتراحات بديلة:

يمكن تجربة:
- تمارا
- تابي

حسب العمر والمبلغ والسجل الائتماني.

`;

}


}




const companyRules =
getCompanyRules(company);



const installments =
calculateInstallments(productAmount);
// =======================
// إنشاء PDF
// =======================


if(!fs.existsSync("reports")){

    fs.mkdirSync("reports");

}



const fileName =
"report_" + Date.now() + ".pdf";


const filePath =
path.join("reports", fileName);



const pdf = new PDFDocument({

    size:"A4",
    margin:50

});



const fontPath =
path.join(
    __dirname,
    "fonts",
    "NotoNaskhArabic-Regular.ttf"
);



if(fs.existsSync(fontPath)){

    pdf.font(fontPath);

}



pdf.pipe(
    fs.createWriteStream(filePath)
);



pdf.fontSize(18)
.text(
"تقرير فحص التمويل",
{
align:"center"
}
);



pdf.moveDown();



pdf.fontSize(12);



pdf.text(
"معلومات العميل"
);


pdf.moveDown();


pdf.text(
"الاسم: " + name
);


pdf.text(
"العمر: " + age
);


pdf.text(
"الوظيفة: " + job
);


pdf.text(
"مدة الخدمة: " + serviceMonths + " شهر"
);


pdf.text(
"الراتب: " + salary + " ريال"
);


pdf.text(
"الالتزامات: " + commitments + " ريال"
);


pdf.text(
"نسبة الالتزام: " +
commitmentRatio.toFixed(1)
+
"%"
);



pdf.moveDown();


pdf.text(
"تفاصيل الطلب"
);


pdf.text(
"الشركة: " +
getCompanyName(company)
);


pdf.text(
"مبلغ المنتجات: " +
productAmount +
" ريال"
);



pdf.moveDown();



pdf.text(
"شروط الشركة:"
);


pdf.text(companyRules);



pdf.moveDown();



pdf.text(
"خيارات التقسيط:"
);


pdf.text(installments);



pdf.moveDown();



pdf.text(
"النتيجة:"
);



pdf.text(message);

pdf.moveDown();


// إظهار الشروط فقط عند الرفض

if(status === "rejected"){

pdf.text(
`
شروط الشركة المختارة:

${companyRules}

سبب الرفض:

${reason}

`
);


if(alternatives){

pdf.moveDown();

pdf.text(
alternatives
);

}


}



if(alternatives){


pdf.moveDown();

pdf.text(alternatives);


}



pdf.end();



res.json({

status,

message,

commitmentRatio:
commitmentRatio.toFixed(1)+"%",

pdf:
"/reports/"+fileName

});



});



app.get("/",(req,res)=>{

res.send(
"Financing System Running"
);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log(
"Server running on port " + PORT
);

});