﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace LiveChatApi
{
    public class Status
    {
        private IApiHandler Api;

        public Status(IApiHandler api)
        {
            Api = api;
        }

        public async Task<string> Get(string groupID = "")
        {
            string uri = "status";
            if (groupID.Length > 0)
            {
                uri += string.Format("/{0}", HttpUtility.UrlEncode(groupID));
            }

            return await Api.Get(uri);
        }
    }
}
