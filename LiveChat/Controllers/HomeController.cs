using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Http.Cors;
using System.Web.Mvc;

namespace LiveChat.Controllers
{
    public class HomeController : Controller
    {
        [HttpPost]
        public ActionResult ChatApi(string url, string method, string token, string body)
        {
            string json = "";
            try
            {
                var myUri = new Uri(url);
                var webReq = WebRequest.Create(myUri);
                var httpWebReq = (HttpWebRequest)webReq;
                httpWebReq.PreAuthenticate = true;
                if (!string.IsNullOrEmpty(token))
                    httpWebReq.Headers.Add("Authorization", "Bearer " + token);
                httpWebReq.ContentType = "application/json";
                httpWebReq.Accept = "application/json";
                httpWebReq.Method = method;
                if (!string.IsNullOrEmpty(body))
                {
                    using (var streamWriter = new StreamWriter(httpWebReq.GetRequestStream()))
                    {
                        streamWriter.Write(body);
                        streamWriter.Flush();
                        streamWriter.Close();
                    }
                }

                var webRes = webReq.GetResponse();
                var responseStream = webRes.GetResponseStream();
                if (responseStream == null) return null;

                var myStreamReader = new StreamReader(responseStream, Encoding.Default);
                json = myStreamReader.ReadToEnd();

                responseStream.Close();
                webRes.Close();
            }
            catch (Exception ex)
            {
                json = ex.Message;
            }
            return Json(json, JsonRequestBehavior.AllowGet);
        }
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}