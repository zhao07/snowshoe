.pragma library

/****************************************************************************
 *   Copyright (C) 2012  Instituto Nokia de Tecnologia (INdT)               *
 *                                                                          *
 *   This file may be used under the terms of the GNU Lesser                *
 *   General Public License version 2.1 as published by the Free Software   *
 *   Foundation and appearing in the file LICENSE.LGPL included in the      *
 *   packaging of this file.  Please review the following information to    *
 *   ensure the GNU Lesser General Public License version 2.1 requirements  *
 *   will be met: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.   *
 *                                                                          *
 *   This program is distributed in the hope that it will be useful,        *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of         *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the          *
 *   GNU Lesser General Public License for more details.                    *
 ****************************************************************************/

Qt.include("UiConstants.js")

var WINDOW_WIDTH = PortraitWidth;
var WINDOW_HEIGHT = PortraitHeight - TabBarHeight;
var TAB_Y_OFFSET = 24 * 2 + /*BUTTON HEIGHT*/ 56;
var TAB_SIZE_TABLE = [ null,        // invalid state
                      [400, 582, 0, 0],   // just one tab (gridsize = 1)
                      [192, 286, 16, 16] ]; // 4 tabs in a grid (gridsize = 2)
                    //[width, height, horizontalspacing, verticalspacing]

var FULLSCREEN_LAYOUT = 1;
var OVERVIEW_LAYOUT = 2;

var MAX_GRID_SIZE = 2;

var tabs = new Array()
var currentTab = -1;
var overviewGridSize = 2;
var currentTabLayout = FULLSCREEN_LAYOUT;

function tabCount()
{
    return tabs.length;
}

function removeTab(index)
{
    var end = tabs.length - 1;
    tabs[index][0].destroy();
    tabs[index][1].destroy();
    for (var i = index; i < tabs.length - 1; i++) {
        tabs[i] = tabs[i+1];
        tabs[i][0].tabNumber = i;
     }
    tabs.pop();
    if (currentTab !== 0)
        currentTab--;
    setTabLayout(currentTabLayout);
}

function createTab(url, navigationPanel, statusParent)
{
    // We set 'z' because WebView must be below the other components of NavigationPanel.
    var webView = Qt.createComponent("SnowshoeWebView.qml").createObject(navigationPanel,
                                                                         { "url" : url,
                                                                           "width" : WINDOW_WIDTH,
                                                                           "height" : WINDOW_HEIGHT,
                                                                           "z": -1 });
    var statusBarIndicator = Qt.createComponent("StatusBarIndicator.qml").createObject(statusParent);
    webView.statusIndicator = statusBarIndicator;

    tabs.push([webView, statusBarIndicator]);
    webView.tabNumber = tabs.length - 1;
    setCurrentTab(webView.tabNumber);
    return webView;
}

function getCurrentTab()
{
    return tabs[currentTab][0];
}

function setCurrentTab(tabIndex)
{
    if (currentTab !== -1) {
        tabs[currentTab][1].active = false;
        tabs[currentTab][0].state = ""
    }
    currentTab = tabIndex;
    tabs[currentTab][1].active = true;
    setTabLayout(currentTabLayout);
}

function goToNextTab()
{
    if (currentTab < tabs.length - 1)
        setCurrentTab(currentTab + 1);
}

function goToPreviousTab()
{
    if (currentTab)
        setCurrentTab(currentTab - 1);
}

function setTabLayout(layout, option)
{
    if (layout === OVERVIEW_LAYOUT) {
        if (option)
            overviewGridSize = option;
        doTabOverviewLayout();
    } else if (layout === FULLSCREEN_LAYOUT) {
        doTabFullScreenLayout();
    }
}

function doTabOverviewLayout()
{
    var size = TAB_SIZE_TABLE[overviewGridSize];
    var xMargin = 40;
    var yMargin = 16;
    var xStep = size[2]
    var yStep = size[3]

    var line = 0;
    var col = 0;
    var tabsPerView = overviewGridSize * overviewGridSize;
    var firstTabToShow = Math.floor(currentTab / tabsPerView) * tabsPerView;
    var lastTabToShow = firstTabToShow + overviewGridSize * overviewGridSize;
    for (var i in tabs)
    {
        var tab = tabs[i][0];
        tab.active = false;

        if (i >= lastTabToShow || i < firstTabToShow) {
            tab.visible = false;
            continue;
        }

        if (col >= overviewGridSize) {
            line++;
            col = 0;
        }

        tab.visible = true;
        tab.x = xMargin + col * (size[0] + xStep);
        tab.y = TAB_Y_OFFSET + line * (size[1] + yStep);
        tab.width = size[0];
        tab.height = size[1];
        col++;
        tab.closeButtonVisible = currentTabLayout === OVERVIEW_LAYOUT && overviewGridSize === 1;
    }
}

function doTabFullScreenLayout()
{
    for (var i in tabs)
    {
        var tab = tabs[i][0];
        tab.width = WINDOW_WIDTH;
        tab.height = WINDOW_HEIGHT;
        tab.x = WINDOW_WIDTH * (i - currentTab);
        tab.y = 0;
        tab.visible = tab.x === 0;
        tab.active = tab.x === 0;
        tab.closeButtonVisible = false;
    }
}
