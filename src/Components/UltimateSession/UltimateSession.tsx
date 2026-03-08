import React, { useState, type SyntheticEvent } from "react";
import { toast } from "react-hot-toast";
import type { RootState } from '../../redux/features/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';